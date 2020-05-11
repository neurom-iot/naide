/*
    Title.  Node-red Node Maker
    Auther. K9714 (kskim.hci@gmail.com)
    Date.   20. 05. 10
    Desc. 
            Node-red 노드를 쉽게 만들 수 있는 어시스트 파일입니다.
*/
const fs = require('fs');

node = {}
// 노드가 저장될 폴더
NODE_SAVE_PATH = __dirname + "/../nodes/";

// json 데이터
node.name = "continues-mnist-dataset";
node.version = "1.0.0";
node.description = "hci-continues mnist dataset node";
node.main = "index.js";
node.keywords = ["continues-mnist-dataset"];
node.author = "HCI";
node.license = "UNLICENSED";

// Node-red 연결 js 파일
NODE_RED_JS = "continues-mnist-dataset.js";
// Node-red js 파일 함수 명
NODE_RED_FUNC_NAME = "CONTI_MNIST_Dataset"

function createNode(node){
    dir = NODE_SAVE_PATH + node.name
    // 경로가 없으면 만듬
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(dir + " 경로 생성.");
    }
    dir = dir + '/';
    node["node-red"] = {}
    node["node-red"].nodes = {};
    node["node-red"].nodes[node.name] = NODE_RED_JS;
    json = JSON.stringify(node);
    html = fs.readFileSync(__dirname + '/temp_html.txt').toString();
    html = replaceNodeString(node, html);
    js = fs.readFileSync(__dirname + '/temp_js.txt').toString();
    js = replaceNodeString(node, js);
    // SAVE
    // json
    fs.writeFileSync(dir + 'package.json', json);
    // js
    fs.writeFileSync(dir + NODE_RED_JS, js, {encoding : 'utf8'});
    // html
    fs.writeFileSync(dir + node.name + '.html', html, {encoding : 'utf8'});
    return;
}

function replaceNodeString(node, str) {
    str = str.replace(/\<NODE_NAME\>/g, '"' + node.name + '"');
    str = str.replace(/\<NODE_DESC\>/g, '"' + node.description + '"');
    str = str.replace(/\<FUNC_NAME\>/g, NODE_RED_FUNC_NAME);
    return str;
}
createNode(node);