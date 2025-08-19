const sceneRoot = document.getElementById("scene-root");

const menuPath = document.getElementById("menu-path");
const backBtn = document.getElementById("back-btn");

let currentList = [];

//Category, Subcategory
function renderList(categories) {
    sceneRoot.innerHTML = "";

    categories.forEach((cat, i) => {

        const box = document.createElement("a-box");
        box.setAttribute("position", `${(i - categories.length/2) * 2 + 1} 0 -3`);
        box.setAttribute("width", "1.5");
        box.setAttribute("height", "1.5");
        box.setAttribute("depth", "0.2");
        box.setAttribute("color", cat.color);

        const text = document.createElement("a-text");
        text.setAttribute("value", cat.name);
        text.setAttribute("align", "center");
        text.setAttribute("color", "#000000");
        text.setAttribute("position", "0 0 0.1");
        text.setAttribute("width", "4.5");
        box.appendChild(text);

        box.addEventListener("click", () => {
        if (cat.options) {
            currentList.push({ data: cat.options, name: cat.name });
            renderList(cat.options);
        } else {
            currentList.push({ data: [], name: cat.name });
            renderItem(cat);
        }
        });

        sceneRoot.appendChild(box);
    })
    updateMenuPath();
}

//Item
function renderItem(item) {
    sceneRoot.innerHTML = "";

    const entity = document.createElement("a-entity");
    entity.setAttribute("geometry", "primitive: dodecahedron; height: 0.8;");
    entity.setAttribute("position", "0 0 -3");
    entity.setAttribute("color", item.color);

    const text = document.createElement("a-text");
    text.setAttribute("value", item.name);
    text.setAttribute("align", "center");
    text.setAttribute("color", "#000000");
    text.setAttribute("position", "0 1.25 0");
    entity.appendChild(text);

    sceneRoot.appendChild(entity);
    updateMenuPath();
}

//Menu path update
function updateMenuPath() {
    const path = currentList.slice(1).map(x => x.name);
    menuPath.textContent = (path.join(" / "));
}

//Back button
backBtn.addEventListener("click", () => {
    if (currentList.length > 1) {
        currentList.pop();
        const prev = currentList[currentList.length - 1];
        renderList(prev.data);
    }
});

//Load json data
fetch("https://raw.githubusercontent.com/peacemaker4/test-assignment-3/refs/heads/main/menu-options.json")
    .then(response => response.json())
    .then(jdata => {
        currentList = [{data: jdata.menu_options}];
        renderList(jdata.menu_options);
    })
    .catch(err => console.error(err));