const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);   

// Escape
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// DOMs
const addBtn = $('.add-btn');
const addTaskModal = $('#addTaskModal');
const closeBtn = $('.btn-close-modal');
const taskForm = $('.todo-app-form');
const todoList = $("#todoList");

// Modal xác nhận
const confirmModal = $('#confirmModal');
const confirmMessage = $('#confirmMessage');
const cancelDeleteBtn = $('#cancelDeleteBtn');
const confirmDeleteBtn = $('#confirmDeleteBtn');

// Forminputs
const formTitle = $('#formTitle');
const formSubmitBtn = $('#formSubmitBtn');
const taskIdInput = $('#task-id');
const titleInput = $('#title');

// Filters
const searchInput = $('#searchInput');
const filterStatus = $('#filterStatus');
const filterCategory = $('#filterCategory');
const filterPriority = $('#filterPriority');
const filterColor = $('#filterColor');

// Modal cảnh báo
const warningModal = $('#warningModal');
const warningMessage = $('#warningMessage');
const closeWarningBtn = $('#closeWarningBtn');

 // Biến để lưu trữ chỉ mục của tác vụ sẽ bị xóa
let taskToDeleteIndex = -1;
const todoTasks = JSON.parse(localStorage.getItem("todoTask")) ?? [];

// Show modal xoá task
function showConfirmModal(message, index) {
    confirmMessage.textContent = message; 
    taskToDeleteIndex = index; 
    confirmModal.classList.add('show'); 
}

// Hidden model xoá task
function hideConfirmModal() {
    confirmModal.classList.remove('show'); // Ẩn modal
    taskToDeleteIndex = -1; // Đặt lại chỉ mục
}

//Show alert
function showWarningModal(message) {
    warningMessage.textContent = message;
    warningModal.classList.add('show');
}

// hidden alert
function hideWarningModal() {
    warningModal.classList.remove('show');
}

closeWarningBtn.onclick = hideWarningModal;


cancelDeleteBtn.onclick = hideConfirmModal; 


confirmDeleteBtn.onclick = function() {
    if (taskToDeleteIndex !== -1) {

        todoTasks.splice(taskToDeleteIndex, 1);

        localStorage.setItem("todoTask", JSON.stringify(todoTasks)); 
        renderTask(todoTasks);
        applyFilters()
    }
    hideConfirmModal(); 
};

//Mở form
function openForm(){
    addTaskModal.className = "modal-overlay show"

    titleInput.focus()
}
//Tắt form
function closeForm(){
    addTaskModal.className = "modal-overlay"
    taskForm.reset()
    
    //Reset form khi edit
    taskIdInput.value = ""; 
    formTitle.textContent = "Add New Task";
    formSubmitBtn.textContent = "Add Task";
    formSubmitBtn.classList.remove('btn-edit-mode'); // Remove any edit mode class
    // Đảm bảo radio màu đầu tiên được chọn mặc định khi reset form
    $('#color-blue').checked = true; 
} 

//Hiển thị modal
addBtn.onclick = openForm

//Đóng modal
closeBtn.onclick = closeForm

//Xử lý khi form on submit
taskForm.onsubmit = event => {
    event.preventDefault() 
    // Lấy toàn bộ dữ liệu từ form
    const newTask = Object.fromEntries(new FormData(taskForm))
    const selectedCardColor = taskForm.querySelector('input[name="cardColor"]:checked').value;

    const editingIndex = $('#task-id').value;

    const currentTitle = $('#title').value.trim().toLowerCase()

    if(editingIndex !== ""){
        if(todoTasks.some((task, index) => task.title.toLowerCase().trim() === currentTitle && index !==
            parseInt(editingIndex))){
                showWarningModal("Task with this title already exists. Please choose a different title.");
                return
            }    
    }else{
        if( todoTasks.some(task => task.title.toLowerCase().trim() === currentTitle)){
            showWarningModal("Task with this title already exists. Please choose a different title.");
            return
        }
    }

    if(editingIndex !== ''){
        let editTask = Object.fromEntries(new FormData(taskForm))
        editTask.isCompleted = todoTasks[editingIndex].isCompleted
        editTask.cardColor = selectedCardColor;

        todoTasks[editingIndex] = editTask
      
    }else{
    newTask.cardColor = selectedCardColor;
    newTask.isCompleted = false

    todoTasks.unshift(newTask)

    }

    localStorage.setItem("todoTask", JSON.stringify(todoTasks))
    renderTask(todoTasks)
    applyFilters()
    closeForm()
}

// Xử lý sự kiện click vào các button trên taskcard
todoList.onclick = function(event){
    const actionBtn = event.target.closest('.action-btn');
    
    //Bắt sự kiện khi nhấn vào card bất kì
    const taskCard = event.target.closest('.task-card');

    //Nếu event ở ngoài card thì không bắt event
    if(!taskCard) return

    const taskTitle = taskCard.querySelector('.task-title').textContent;
    const index = parseInt(taskCard.dataset.index)
    const cardValue = todoTasks[index]

    if(!actionBtn) return; // Nếu không phải nút hành động thì thoát

    //Bắt event click vào button
    if(actionBtn.classList.contains('btn-delete')){
        
        showConfirmModal(`Are you sure you want to delete the task "${taskTitle}"?`, index);

    }else if(actionBtn.classList.contains('btn-complete')){
        todoTasks[index].isCompleted = !todoTasks[index].isCompleted;
        
        localStorage.setItem("todoTask", JSON.stringify(todoTasks)); 
        renderTask(todoTasks); 

    }else if(actionBtn.classList.contains('btn-edit')){
        $('#formTitle').innerText = 'Edit Task';
        $('#formSubmitBtn').innerText = 'Update Task';

        // Lưu index vào hidden input để form submit biết là đang edit
        $('#task-id').value = index;

        // Điền dữ liệu của task vào form
        $('#title').value = cardValue.title;
        $('#description').value = cardValue.description;
        $('#category').value = cardValue.category;
        $('#priority').value = cardValue.priority;
        $('#startTime').value = cardValue.startTime;
        $('#endTime').value = cardValue.endTime;
        $('#dueDate').value = cardValue.dueDate;

        // Chọn đúng màu cho radio button
        taskForm.querySelector(`input[name="cardColor"][value="${cardValue.cardColor}"]`).checked = true;
        
        // Mở form
        openForm();
    }
    
}

//Filter
function applyFilters() {
    const searchKeyword = searchInput.value.toLowerCase().trim()
    const status = filterStatus.value 
    const category = filterCategory.value
    const priority = filterPriority.value
    const color = filterColor.value
    
    let filteredTasks = todoTasks

    // Tìm kiếm theo từ khóa
    if(searchKeyword){
        filteredTasks = filteredTasks.filter(tasks =>
            tasks.title.toLowerCase().trim().includes(searchKeyword) ||
            tasks.description.toLowerCase().trim().includes(searchKeyword)
        )
    }

    // Lọc theo trạng thái
    if(status !== 'all'){
        filteredTasks = filteredTasks.filter(tasks => {
            return status === 'completed' ? tasks.isCompleted : !tasks.isCompleted
        })
    }

    //Lọc theo category
    if(category !==  'all'){
        filteredTasks = filteredTasks.filter(tasks => tasks.category === category)
    }

    //Lọc theo priority
    if(priority !== 'all'){
        filteredTasks = filteredTasks.filter(tasks => tasks.priority === priority)
    }

    //Lọc theo color
    if(color !== 'all'){
        filteredTasks = filteredTasks.filter(tasks => tasks.cardColor === color)
    }

    renderTask(filteredTasks)
}

//Gắn sự kiện cho bộ lọc
searchInput.addEventListener('input', applyFilters);
filterStatus.addEventListener('change', applyFilters);
filterCategory.addEventListener('change', applyFilters);
filterPriority.addEventListener('change', applyFilters);
filterColor.addEventListener('change', applyFilters);

function renderTask(tasks){

    if (!tasks || tasks.length === 0) {
        // Hiển thị thông báo khi không có task nào hoặc không tìm thấy
        const message = todoTasks.length === 0 ? "Nothing here..." : "Can not find the right task...";
        todoList.innerHTML = `<p class="empty-message">${message}</p>`;
        return;
    }

    const html = tasks.map((task, index) => 
        `
           <div class="task-card ${task.isCompleted ? 'completed' : ''}" data-index="${index}">
            <div class="task-header ${task.cardColor}">
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
                <div class="task-actions">

                    <button class="action-btn btn-complete">
                        ${task.isCompleted 
                            ? '<i class="fa-solid fa-circle-check"></i>' 
                            : '<i class="fa-regular fa-circle"></i>'
                        }
                    </button>

                   <button class="action-btn btn-edit"><i class="fa-solid fa-pen"></i></button>

                    <button class="action-btn btn-delete"><i class="fa-solid fa-trash"></i></button>

                </div>
            </div>
            <div class="task-body">
                <p class="task-description">${escapeHTML(task.description)}</p>
                <div class="task-meta">
                    <span class="task-category">${escapeHTML(task.category)}</span>
                    <span class="task-priority ${escapeHTML(task.priority.toLowerCase())}">${escapeHTML(task.priority)}</span>
                </div>
            </div>
            <div class="task-footer">
               <span class="task-due-date">Due: ${escapeHTML(task.dueDate)}</span>
            </div>
        </div>
        `
    ).join('')
    todoList.innerHTML = html
}

document.addEventListener('DOMContentLoaded', applyFilters);