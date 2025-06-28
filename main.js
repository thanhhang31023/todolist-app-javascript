const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);   

// Hàm tiện ích để thoát các ký tự HTML đặc biệt
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

const addBtn = $('.add-btn')
const addTaskModal = $('#addTaskModal')
const closeBtn = $('.btn-close-modal')
const titleInput = $('#title')
const taskForm = $('.todo-app-form')
const todoList = $("#todoList")

const confirmModal = $('#confirmModal'); 
const confirmMessage = $('#confirmMessage'); 
const cancelDeleteBtn = $('#cancelDeleteBtn'); 
const confirmDeleteBtn = $('#confirmDeleteBtn'); 

let taskToDeleteIndex = -1; // Biến để lưu trữ chỉ mục của tác vụ sẽ bị xóa

// Show modal xác nhận
function showConfirmModal(message, index) {
    confirmMessage.textContent = message; 
    taskToDeleteIndex = index; 
    confirmModal.classList.add('show'); 
}

// Hidden modal xác nhận
function hideConfirmModal() {
    confirmModal.classList.remove('show'); // Ẩn modal
    taskToDeleteIndex = -1; // Đặt lại chỉ mục
}


cancelDeleteBtn.onclick = hideConfirmModal; 


confirmDeleteBtn.onclick = function() {
    if (taskToDeleteIndex !== -1) {

        todoTasks.splice(taskToDeleteIndex, 1);

        localStorage.setItem("todoTask", JSON.stringify(todoTasks)); 
        renderTask(todoTasks);
    }
    hideConfirmModal(); 
};


function openForm(){
    addTaskModal.className = "modal-overlay show"

    titleInput.focus()
}

function closeForm(){
    addTaskModal.className = "modal-overlay"
    taskForm.reset()
} 

//Hiển thị modal
addBtn.onclick = openForm

//Đóng modal
closeBtn.onclick = closeForm

//Lấy giá trị từ localStorage add vào mảng
const todoTasks = JSON.parse(localStorage.getItem("todoTask")) ?? [];

//Xử lý khi form on submit
taskForm.onsubmit = event => {
    event.preventDefault() 
    // Lấy toàn bộ dữ liệu từ form
    const newTask = Object.fromEntries(new FormData(taskForm))
    const selectedCardColor = taskForm.querySelector('input[name="cardColor"]:checked').value;

    const editingIndex = $('#task-id').value;

    if(editingIndex !== ''){
        let editTask = Object.fromEntries(new FormData(taskForm))
        editTask.isCompleted = todoTasks[editingIndex].isCompleted
        editTask.cardColor = selectedCardColor;

        todoTasks[editingIndex] = editTask
        localStorage.setItem("todoTask", JSON.stringify(todoTasks))

        closeForm()
    }else{

    newTask.cardColor = selectedCardColor;
    newTask.isCompleted = false

    todoTasks.unshift(newTask)
   
    localStorage.setItem("todoTask", JSON.stringify(todoTasks))

    closeForm()
    }

     renderTask(todoTasks)
}

// Xử lý sự kiện click vào các button trên taskcard
todoList.onclick = function(event){
    const actionBtn = event.target.closest('.action-btn');
    const completeBtn = event.target.closest('.btn-complete');
    const editBtn = event.target.closest('.btn-edit');
    const deleteBtn = event.target.closest('.btn-delete')
    
    
    

    
    //Bắt sự kiện khi nhấn vào card bất kì
    const taskCard = event.target.closest('.task-card');

    //Nếu event ở ngoài card thì không bắt event
    if(!taskCard) return

    const taskTitle = taskCard.querySelector('.task-title').textContent;
    const index = parseInt(taskCard.dataset.index)
    const cardValue = todoTasks[index]

    if(!actionBtn) return; // Nếu không phải nút hành động thì thoát

    //Bắt event click vào button
    if(actionBtn === deleteBtn){
        
        showConfirmModal(`Are you sure you want to delete the task "${taskTitle}"?`, index);

    }else if(actionBtn === completeBtn){
        todoTasks[index].isCompleted = !todoTasks[index].isCompleted;
        
        localStorage.setItem("todoTask", JSON.stringify(todoTasks)); 
        renderTask(todoTasks); 

    }else if(actionBtn === editBtn){
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

function renderTask(tasks){

    if(!tasks.length){
        // Thêm class "empty-message" vào thẻ p
        todoList.innerHTML= `<p class="empty-message"> Nothing here... </p>`
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


renderTask(todoTasks)