const sceneRoot = document.getElementById("scene-root");

const menuPath = document.getElementById("menu-path");
const backBtn = document.getElementById("back-btn");

let currentList = [];
let menuData = null;

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
    entity.setAttribute("geometry", "primitive: dodecahedron; radius: 1;");
    entity.setAttribute("material", `color:${item.color}`);
    entity.setAttribute("position", "0 0 -3");

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
    const pathParts = currentList.slice(1).map(x => x.name);
    menuPath.innerHTML = "";
    menuPath.textContent = (pathParts.join(" / "));

    //Add params to path
    const pathString = pathParts.join("/");
    const newUrl = window.location.pathname + (pathString ? `?path=${pathString}` : "");
    window.history.replaceState({}, "", newUrl);
}

//Back button
backBtn.addEventListener("click", () => {
    if (currentList.length > 1) {
        currentList.pop();
        const prev = currentList[currentList.length - 1];
        renderList(prev.data);
    }
});

//Open link to item
function navigateToPath(pathParts, options) {
    let opt = options;

    for (const p of pathParts) {
        const found = opt.find(i => i.name === p);
        if (!found) {
            return renderList(opt);
        }

        currentList.push({ data: found.options || [], name: found.name });
        opt = found.options || [];

        if (opt.length === 0) {
            return renderItem(found);
        }
    }

    return renderList(opt);
}

//Load json data
fetch("https://raw.githubusercontent.com/peacemaker4/test-assignment-3/refs/heads/main/menu-options.json")
    .then(response => response.json())
    .then(jdata => {
        menuData = jdata.menu_options;

        currentList = [{data: menuData}];

        //Check url for path
        const urlParams = new URLSearchParams(window.location.search);
        const pathParam = urlParams.get("path");
        if (pathParam) {
            const pathParts = pathParam.split("/");
            navigateToPath(pathParts, menuData);
        } else {
            renderList(menuData);
        }
    })
    .catch(err => console.error(err));