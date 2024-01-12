document.addEventListener("DOMContentLoaded", () => {
    localStorage.clear();
    const app = {
        taskList: document.getElementById("taskList"),
        txtTask: document.getElementById("txtTask"),
        txtDate: document.getElementById("txtDate"),
        txtSearch: document.getElementById("txtSearch"),
        btnSave: document.getElementById("btnSave"),
        btnSearch: document.getElementById("btnSearch"),
        checkboxes: document.querySelectorAll("input[type='checkbox']"),
        emptyList: document.createElement("li"),
        
        init: () => {
            app.DefaultList();
            app.btnSave.addEventListener("click", app.Save);
            app.txtSearch.addEventListener("input", app.Search);
            app.checkboxes.forEach((checkbox) => {
                checkbox.addEventListener("change", app.CheckBox);
            });
            app.emptyList.innerHTML = '<div class="empty">Brak zadań</div';
        },

        DefaultList: () => {
            const tasks = JSON.parse(localStorage.getItem("tasks")) || [
                ["chocolate", "2000-01-01"],
                ["macaroon", ""],
                ["chupa chups", ""],
                ["candy canes", "2000-01-05"],
                ["bon bons", ""]
            ];

            tasks.forEach(task => {
                app.CreateTask(task[0], task[1]);
            });
        },

        Save: () => {
            const task = app.txtTask.value.trim();
            const date = app.txtDate.value;
            const today = new Date().toISOString().split('T')[0];
            const length = task.length;
            if (length >= 3 && (!date || date >= today)) {
                app.CreateTask(task, date);
                app.txtTask.value = "";
                app.txtDate.value = "";
                
                if (app.taskList.contains(app.emptyList) && app.taskList.childElementCount > 1) {
                    app.emptyList.remove();
                }

                app.SaveTasksToLocalStorage();
            }
            else {
                if (length < 3) {
                    alert("Zadanie musi mieć co najmniej 3 znaki");
                }
                else if (date < today) {
                    alert("Data nie może być wcześniejsza, niż dzisiejsza");
                }
            }
        },

        CreateTask: (task, date) => {
            date = app.Format(date);
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="checkbox">
                    <input type="checkbox">
                </div>
                <div class="task">
                    <label>${task}</label>
                    <div class="date">${date}</div>
                </div>
                <div class="buttons">
                    <button class="edit"><img src="icnEdit.png"></button>
                    <button class="delete"><img src="icnDelete.png"></button>
                </div>
            `;

            app.taskList.appendChild(li);
            const editButton = li.querySelector(".edit");
            editButton.addEventListener("click", () => app.Edit(li));
            
            const deleteButton = li.querySelector(".delete");
            deleteButton.addEventListener("click", () => app.Delete(li));
            
            const checkbox = li.querySelector("input[type='checkbox']");
            checkbox.addEventListener("change", () => app.CheckBox(checkbox, li));

            app.SaveTasksToLocalStorage();
        },

        Delete: li => {
            li.remove();
            app.CheckList();
            app.SaveTasksToLocalStorage();
        },

        Format: (dateString, format = "eur") => {
            if (!dateString) {
                return dateString;
            }
            
            let year, month, day;
            if (format == "iso") {
                const part = dateString.split(".");
                day = part[0];
                month = part[1];
                year = part[2];
                return `${year}-${month}-${day}`;
            }
            else {
                const part = dateString.split("-");
                year = part[0];
                month = part[1];
                day = part[2];
                return `${day}.${month}.${year}`;
            }
    
            
        },    

        Edit: li => {
            const label = li.querySelector("label");
            const date = li.querySelector(".date");
            const taskDate = app.Format(date.textContent, "iso");
            const editButton = li.querySelector(".edit");
            const img = editButton.querySelector("img");
            
            if (img.src.endsWith("icnEdit.png")) {
                label.contentEditable = true;
                date.innerHTML = `<input type="date" value="${taskDate}" class="editDate">`;
                label.style.border = "2px solid red";
                label.style.margin = "0 -1.9px 0 -1.9px";
                editButton.style.border = "2px solid red";
                img.src = "icnSave.png";
            } else {
                const editedTask = label.textContent.trim();
                const inputDate = date.querySelector("input[type='date']");
                const editedDate = app.Format(inputDate.value);
                
                if (editedTask.length >= 3) {
                    label.contentEditable = false;
                    date.innerHTML = editedDate;
                    label.style.border = "none";
                    label.style.margin = "0";
                    editButton.style.border = "1px solid black";
                    img.src = "icnEdit.png";
                } else {
                    alert("Zadanie musi mieć co najmniej 3 znaki");
                }
            }

            app.SaveTasksToLocalStorage();
        },

        CheckBox: (checkbox, li) => {
            li.style.backgroundColor = checkbox.checked ? "transparent" : "";
            app.SaveTasksToLocalStorage();
        },

        CheckList: () => {
            const length = app.taskList.getElementsByTagName("li").length;
            if (length == 0) {
                app.taskList.appendChild(app.emptyList);
            }
        },

        Search: () => {
            const searchValue = app.txtSearch.value.trim().toLowerCase();
            app.taskList.querySelectorAll("li").forEach((li) => {
                const label = li.querySelector("label");
                const taskText = label.textContent.trim().toLowerCase();
            
                if (searchValue.length >= 2) {
                    if (searchValue === "") {
                        label.innerHTML = label.textContent;
                        li.style.display = "flex";
                    } else if (taskText.includes(searchValue)) {
                        label.innerHTML = label.textContent.replace(new RegExp(`(${searchValue})`, "gi"), '<span class="highlight">$1</span>');
                        li.style.display = "flex";
                    } else {
                        label.innerHTML = label.textContent;
                        li.style.display = "none";
                    }
                } else {
                    label.innerHTML = label.textContent;
                    li.style.display = "flex";
                }
            });
        },

        SaveTasksToLocalStorage: () => {
            const tasks = Array.from(app.taskList.getElementsByTagName("li")).map(li => {
                const label = li.querySelector("label");
                const date = li.querySelector(".date");
                return [label.textContent, date.textContent];
            });

            localStorage.setItem("tasks", JSON.stringify(tasks));
        }              
    };
    app.init();
});