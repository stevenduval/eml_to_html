//set reusable variables 
const reloadBtn =  document.querySelector('.reload');
const formatBtn =  document.querySelector('.format');
const fileSelector = document.getElementById('file-selector');
const reader = new FileReader();

const readFile = () => {
    const [file] = document.querySelector('input[type=file]').files;
    const reader = new FileReader();
    let fileName;
  
    reader.addEventListener("load", () => {
        if (fileName.indexOf('.eml') < 0) {
            alert('.eml files only');
            fileSelector.value = '';
            return;
        }  
        fileExport(reader.result, fileName);

    }, false);

    if (file) {
      reader.readAsText(file);
      fileName = file.name;
    }
}

// run file export process when load event triggers
const fileExport = (data, fileName) => {
    const base64data = readEMLFile(data);
    saveOutput(base64data, fileName);
}

// read the inbound data
const readEMLFile = (data) => {
    const regex = /(?<=base64\r\n\r\n)[^--]+/g
    const datas = data.match(regex);
    let dataToReturn;
    datas.forEach(data => {
        // code used below is from Jackie Han : https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
        const text = atob(data);
        const length = text.length;
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = text.charCodeAt(i);
        }
        const decoder = new TextDecoder(); // default is utf-8
        let decodedData = decoder.decode(bytes);
        if (decodedData.indexOf('<DOCTYPE') >= 0 || decodedData.indexOf('<body') >= 0) {
            dataToReturn = decodedData;
        }
    });
    return dataToReturn;
}

// save file to computer
const saveOutput = (data, fileName) => { 
    fileName = fileName.split('.eml')[0];
    const blob = new Blob([data], { type: "text/html"});
    const anchor = document.createElement("a");
    const getDateTime = new Date().toLocaleString('en-gb').split(", ");
    const date = getDateTime[0].split("/").reverse().join("");
    const time = getDateTime[1].split(":").join("");
    anchor.download = `${fileName}_converted_${date}${time}.html`;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    fileSelector.value = '';
}
