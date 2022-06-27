//set reusable variables 
const fileSelector = document.getElementById('file-selector');
const reader = new FileReader();

const readFile = () => {
    const [file] = fileSelector.files;
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
    // variable that will be populated with data to be returned
    let dataToReturn;
    // set regex to case insensitive so we can split file where html is
    let htmlSplit = new RegExp('Content-Type: text/html;', "i");
    // split file where text/html is using regex above, grab the text after the split
    data = data.split(htmlSplit)[1];
    // regex to grab html content
    const regex = /(?<=Content-Transfer-Encoding: [\w-]+\r\n)[^]+?(?=\r\n-{6}=|\r\n--_|\r\n--\w)/gi;
    // results of regex
    const regexData = data.match(regex);
    // run each result
    regexData.forEach(data => {
        // if plain html return it directly
        if (data.indexOf('=3D"') < 0 && (data.indexOf('<DOCTYPE') >= 0 || data.indexOf('<body') >= 0 || data.indexOf('</') >= 0)) {
            dataToReturn = data;
        // if quoted-printable run the following    
        } else if (data.indexOf('=3D"') >= 0) {
            // normalise end-of-line signals 
            data = data.replace(/(\r\n|\n|\r)/g, "\n");
            // replace equals sign at end-of-line with nothing
            data = data.replace(/=\n/g, "");
            //replace added line breaks with nothing
            data = data.replace(/\n/g, "");
            // replace all percent signs with something we can find
            data = data.replace(/%/g, "PERCENTSIGNREPLACED");
            // replace all equal signs with percent sign
            data = data.replace(/=/g, "%");
            // decode the html
            data = decodeURIComponent(data);
            // change the changed percent signs back
            data = data.replace(/PERCENTSIGNREPLACED/g, "%");
            // return the data
            dataToReturn = data;
        // otherwise its likely base64 encoded    
        } else {
            // base64 decode data
            const text = atob(data);
            // code used below is from Jackie Han : https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
            const length = text.length;
            const bytes = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                bytes[i] = text.charCodeAt(i);
            }
            const decoder = new TextDecoder(); // default is utf-8
            dataToReturn = decoder.decode(bytes);
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
