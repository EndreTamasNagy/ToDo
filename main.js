const electron = require('electron');

//app= running electron process
const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let newTodoWindow;

//Electron Events
//when electron process is ready
app.on('ready', ()=>{
    mainWindow = new BrowserWindow({fullscreen: false}); //create main window    
    mainWindow.loadFile('main.html');   //load html file
    mainWindow.on('closed', ()=>app.quit());    //if the mainWindow is closed, the complete app should be closed

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

function createNewTodoWindow(){
    newTodoWindow = new BrowserWindow({width: 300, height: 200, title: 'Add New ToDo'});
    newTodoWindow.loadFile('newTodo.html');
    newTodoWindow.on('closed', ()=>{newTodoWindow = null; });
}

ipcMain.on('todo:add', (event, todo)=>{
    //forward the mesage to mainWindow
    mainWindow.webContents.send('todo:add',todo);
    newTodoWindow.close(); //close window
});

const menuTemplate=[
    { label:'File',
      submenu: [
          { 
              label: 'New ToDo',
              accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
              click() {createNewTodoWindow()}
          },{
              label: 'Clear ToDos',
              click(){
                //communicate toward the main window to empty the unordered list
                mainWindow.webContents.send('todo:clear');

              }
          },{
              label: 'Exit',
              accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',  //immediately invoked function
              click() { app.quit(); }
          }
        ] 
    },
    {label: 'Edit'}
];

//if OSx, shift the menu by one
if(process.platform === 'darwin'){
    menuTemplate.unshift({});
}

// states:
// 'production'
// 'development'
// 'staging'
// 'test'
if(process.env.NODE_ENV !== 'production'){
    menuTemplate.push({
        label: 'Developer',
        submenu: [
            {
                label: 'Toogle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) { 
                    focusedWindow.webContents.toggleDevTools(); //toggle the dev tools on the focused window
                }
            },{
                role: 'reload'
            }
        ]
    })
}

