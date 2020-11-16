/*
    Title.  Node-red Node Maker
    Auther. K9714 (kskim.hci@gmail.com)
    Date.   20. 05. 10
    Desc. 
            Node-red 노드를 쉽게 만들 수 있는 어시스트 파일입니다.
*/
const { exception } = require('console');
const fs = require('fs');

node = {}
// 노드가 저장될 폴더
NODE_SAVE_PATH = __dirname + "/../nodes/";
// 저장될 폴더명
NODE_SAVE_PATH_NAME = "TestNode";
// json 데이터
node.name = "test_node";
node.version = "1.0.0";
node.description = "hci code_viewer node";
node.main = "index.js";
//node.keywords = ["code_viewer"];
node.author = "HCI";
node.license = "UNLICENSED";

// Node-red 연결 js 파일
NODE_RED_JS = ["test_node1", "test_node2"];
// Node-red js 파일 함수 명
NODE_RED_FUNC_NAME = ["TestNode1", "TestNode2"]

function createNode(node){
    dir = NODE_SAVE_PATH + NODE_SAVE_PATH_NAME;
    // 경로가 없으면 만듬
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(dir + " 경로 생성.");
    }
    dir = dir + '/';
    node["node-red"] = {}
    node["node-red"].nodes = {};
    
    NODE_RED_JS.forEach(function(e, i) {
        node["node-red"].nodes[e] = e + ".js";
        html = fs.readFileSync(__dirname + '/temp_html.txt').toString();
        html = replaceNodeString(i, node, html);
        js = fs.readFileSync(__dirname + '/temp_js.txt').toString();
        js = replaceNodeString(i, node, js);
        
        // js
        fs.writeFileSync(dir + e + ".js", js, {encoding : 'utf8'});
        
        // html
        fs.writeFileSync(dir + e + '.html', html, {encoding : 'utf8'});
        
    });
    // json
    json = JSON.stringify(node);
    fs.writeFileSync(dir + 'package.json', json);
    return;
}

function replaceNodeString(i, node, str) {
    str = str.replace(/\<NODE_NAME\>/g, '"' + NODE_RED_JS[i] + '"');
    str = str.replace(/\<NODE_DESC\>/g, '"' + node.description + '"');
    str = str.replace(/\<FUNC_NAME\>/g, NODE_RED_FUNC_NAME[i]);
    return str;
}
createNode(node);

