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
    //const workBookData = formatWorkBookData(workBook);
    //const finalData = formatOutput(workBookData[0]);
    saveOutput(base64data);
}

// read the inbound data
const readEMLFile = (data) => {
    const regex = /(?<=base64\r\n\r\n)[^=]*=+/g
    const datas = data.match(regex);
    let dataToReturn;
    datas.forEach(data => {
        let decodedData = window.atob(data);
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
