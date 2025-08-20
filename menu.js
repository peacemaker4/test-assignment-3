const sceneRoot = document.getElementById("scene-root");

const menuPath = document.getElementById("menu-path");
const backBtn = document.getElementById("back-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const deleteBtn = document.getElementById("delete-btn");
const exportBtn = document.getElementById("export-btn");

let currentList = [];
let menuData = null;

//Category, Subcategory
function renderList(categories) {
    sceneRoot.innerHTML = "";

    //Category item list is empty
    if(!categories.length){
        const entity = document.createElement("a-entity");
        entity.setAttribute("text", "value: This category is empty; color:#000000;");
        entity.setAttribute("position", "0.25 0 -1");
        sceneRoot.appendChild(entity);
    }

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
    prevBtn.hidden = true
    nextBtn.hidden = true
    deleteBtn.hidden = true

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

    //Item controls
    let subitems = currentList[currentList.length - 2].data
    if(subitems.length > 1){
        prevBtn.hidden = false
        nextBtn.hidden = false
    }
    deleteBtn.hidden = false

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
backBtn.addEventListener("click", () => navigateBack());
function navigateBack(){
    if (currentList.length > 1) {
        currentList.pop();
        const prev = currentList[currentList.length - 1];
        renderList(prev.data);
    }
}

//Scroll items in same subcategory
prevBtn.addEventListener("click", () => navigateItem(-1));
nextBtn.addEventListener("click", () => navigateItem(1));

function navigateItem(direction) {
    let curr_item = currentList[currentList.length - 1]
    let subitems = currentList[currentList.length - 2].data
    let item_index = subitems.findIndex(i => i.name === curr_item.name)
    
    const next_index = (item_index + direction + subitems.length) % subitems.length;
    renderItem(subitems[next_index])
    currentList[currentList.length - 1] = subitems[next_index]
    updateMenuPath();
}

//Delete button
deleteBtn.addEventListener("click", () =>{
    let subitems = currentList[currentList.length - 2].data
    let curr_item = currentList[currentList.length - 1]
    let item_index = subitems.findIndex(i => i.name === curr_item.name)

    let subcategory = currentList[currentList.length - 2]
    let category = currentList[currentList.length - 3]
    
    let option = menuData.find(i => i.name == category.name).options.find(o => o.name == subcategory.name)
    option.options.splice(item_index, 1)
    navigateBack()
})

//Export button
exportBtn.addEventListener("click", () =>{
    const jsonStr = JSON.stringify(menuData, null, 2);

    const blob = new Blob([jsonStr], { type: "application/json" });

    exportBtn.href = URL.createObjectURL(blob);
    exportBtn.download = "export.json";
})

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