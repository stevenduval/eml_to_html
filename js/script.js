//set reusable variables 
const reloadBtn =  document.querySelector('.reload');
const formatBtn =  document.querySelector('.format');
const fileSelector = document.getElementById('file-selector');
const reader = new FileReader();

// detect when file is inserted
fileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files[0];
    readFile(fileList);
});
            
//read file as text which then fires load event to send data to formatting 
const readFile = (file) => { 
    reader.addEventListener('load', (event) => fileExport(event.target.result));
    reader.readAsText(file);
}

// run file export process when load event triggers
const fileExport = (data) => {
    const base64data = readEMLFile(data);
    saveOutput(base64data);
}

// read the inbound data
const readEMLFile = (data) => {
    const regex = /(?<=base64\r\n\r\n)[^--]+/g
    const datas = data.match(regex);
    let dataToReturn;
    datas.forEach(data => {
        // code used below is from here (from Jackie Han) : https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
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
const saveOutput = (data) => { 
    const blob = new Blob([data], { type: "text/html"});
    const anchor = document.createElement("a");
    const getDateTime = new Date().toLocaleString('en-gb').split(", ");
    const date = getDateTime[0].split("/").reverse().join("");
    const time = getDateTime[1].split(":").join("");
    anchor.download = `converted_email_${date}${time}.html`;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}
