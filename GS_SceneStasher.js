function GS_SceneStasher() {
    var projectPath = scene.currentProjectPath();
    if (!projectPath) {
        MessageBox.information("Błąd: Scena nie jest zapisana!\n\nZapisz najpierw scenę na dysku (Ctrl+S).");
        return;
    }

    var stashFile = projectPath + "/scene_stasher.json";

    function loadStashes() {
        var f = new File(stashFile);
        if (!f.exists) return {};
        
        f.open(1); // ReadOnly = 1
        // FIX: W API Toon Booma używamy .read() a nie .readAll()
        var content = f.read(); 
        f.close();
        
        if (!content) return {};
        
        try {
            return JSON.parse(content);
        } catch (e) {
            MessageLog.trace("GS_SceneStasher - Błąd parsowania JSON: " + e);
            return {};
        }
    }

    function saveStashes(data) {
        var f = new File(stashFile);
        f.open(2); // WriteOnly = 2
        f.write(JSON.stringify(data, null, 2));
        f.close();
    }

    var stashes = loadStashes();

    // ---------------- UI SETUP (QDialog) ---------------- //
    var dialog = new QDialog();
    dialog.setWindowTitle("GS Scene Stasher");
    dialog.resize(320, 420); 
    
    var layout = new QVBoxLayout(dialog);

    var listWidget = new QListWidget();
    layout.addWidget(listWidget, 0, 0);

    function refreshList() {
        listWidget.clear();
        for (var key in stashes) {
            listWidget.addItem(key);
        }
    }
    refreshList();

    var currentFrame = frame.current();
    var inputName = new QLineEdit();
    inputName.text = "Frame " + currentFrame + " - Compo";
    layout.addWidget(inputName, 0, 0);

    var btnAdd = new QPushButton("Stash Selection & Frame");
    layout.addWidget(btnAdd, 0, 0);

    var btnRestore = new QPushButton("Restore Selected Stash");
    layout.addWidget(btnRestore, 0, 0);

    var btnRemove = new QPushButton("Remove Stash");
    layout.addWidget(btnRemove, 0, 0);

    // ---------------- LOGIKA PRZYCISKÓW ---------------- //
    
    btnAdd.clicked.connect(function() {
        var name = inputName.text;
        if (!name) return;

        var numSel = selection.numberOfNodesSelected();
        var selNodes = [];
        for (var i = 0; i < numSel; i++) {
            selNodes.push(selection.selectedNode(i));
        }

        stashes[name] = {
            frame: frame.current(),
            nodes: selNodes
        };
        
        saveStashes(stashes);
        refreshList();
        MessageLog.trace("GS_SceneStasher: Zapisano stash -> " + name);
    });

    btnRestore.clicked.connect(function() {
        var currentItem = listWidget.currentItem();
        if (!currentItem) return;
        
        var key = currentItem.text();
        var data = stashes[key];

        if (data) {
            frame.setCurrent(data.frame);
            selection.clearSelection();
            for (var i = 0; i < data.nodes.length; i++) {
                if (node.type(data.nodes[i])) { 
                    selection.addNodeToSelection(data.nodes[i]);
                }
            }
            MessageLog.trace("GS_SceneStasher: Przywrócono stash -> " + key);
        }
    });

    btnRemove.clicked.connect(function() {
        var currentItem = listWidget.currentItem();
        if (!currentItem) return;
        
        var key = currentItem.text();
        delete stashes[key];
        
        saveStashes(stashes);
        refreshList();
        MessageLog.trace("GS_SceneStasher: Usunięto stash -> " + key);
    });

    dialog.exec();
}