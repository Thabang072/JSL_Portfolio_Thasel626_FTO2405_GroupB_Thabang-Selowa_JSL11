// TASK: import helper functions from utils
import { getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask  } from"../utils/taskFunction.js";
// TASK: import initialData
import { initialData } from "./initialData.js";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData(data) {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll("#column-div"),
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"),
  editTaskModal: document.querySelector("#edit-task-modal-window")

}

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}


// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });
      // fixed a bug here
      tasksContainer.appendChild(taskElement);
    });
  });
}



function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').foreach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild(taskElement);
}


function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',()  => toggleSidebar(true));

  
const toggleTheme = () => {
  document.body.classList.toggle('dark-theme');
};

document.querySelector('#themeToggle').addEventListener('click', toggleTheme);

  // Theme switch event listener
 // elements.themeSwitch.addEventListener('change', toggleTheme);
//if (themeSwitch.checked) {
  //document.body.classList.add('dark-theme')
//} else {
 // document.body.classList.remove('dark-theme')
//}
  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
  const taskTitle = document.getElementById("title-input").value;
    const task = {
      "title" : document.getElementById("title-input").value,
      "description" : document.getElementById("dec-input").value,
      "status" : document.getElementById("select-status"),
      "board" : elements.headerBoardName.textContent

      
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  document.getElementById("side-bar-div").style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
  localStorage.showSideBar = show;
 
}

function toggleTheme() {
  const logo = document.getElementById("logo");
  document.body.classList.toggle('light-theme');
  localStorage.setItem("isLightTheme", document.body.classList.contains("light-theme"));
  localStorage.getItem("isLightTheme") === "true" ? logo.setAttribute("src", "./assets/logo-light.svg") : logo.setAttribute("src", "./assets/logo-dark.svg");
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  let taskTitleEl = document.getElementById("edit-task-title-input");
  let taskDescriptionEl = document.getElementById("edit-task-desc-input");
  let taskStatusEl = document.getElementById("edit-select-status");

  taskTitleEl.value = task.title;
  taskDescriptionEl.value = task.description;
  taskStatusEl.value = task.status;

  elements.editTaskModal.style.display = "block";

  document.getElementById("cancel-edit-btn").addEventListener("click", () => elements.editTaskModal.style.display = "none");

  document.getElementById("delete-task-btn").addEventListener("click", () => {
    deleteTask(task.id)
    refreshTasksUI()
    elements.editTaskModal.style.display = "none"
  });

  document.getElementById("save-task-changes-btn").addEventListener("click", () => saveTaskChanges(task.id));


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  
  let taskTitleEl = document.getElementById("edit-task-title-input");
  let taskDescriptionEl = document.getElementById("edit-task-desc-input");
  let taskStatusEl = document.getElementById("edit-select-status");

  // Create an object with the updated task details
  let updatedTask = {
    "id": taskId,
    "title": taskTitleEl.value,
    "description": taskDescriptionEl.value,
    "status": taskStatusEl.value,
    "board": elements.headerBoardName.textContent
  };

  // Update task using a hlper functoin
 putTask(taskId, updatedTask);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  localStorage.getItem("isLightTheme") === "true" ? logo.setAttribute("src", "./assets/logo-light.svg") : logo.setAttribute("src", "./assets/logo-dark.svg");
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}