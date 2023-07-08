// Import dependencies
import multer from 'multer';
import path from 'path';
import Express from 'express';
import fs from "fs";
import PDFParser from "pdf2json";
import Gradelist from '../models/student.js'
const db = "mongodb+srv://Sanjeev:Sanju266@cluster0.erlocnt.mongodb.net/FullStack?retryWrites=true&w=majority";


const router = Express.Router();





const pdfParser = new PDFParser();
// Get all the filenames from the patients folder
const files = fs.readdirSync("./images");

// All of the parse patients
let patients = [];

// Make a IIFE so we can run asynchronous code



async function getPdf() {

  // Await all of the patients to be passed
  // For each file in the patients folder
  await Promise.all(files.map(async (file) => {

    // Set up the pdf parser
    let pdfParser = new PDFParser(this, 1);

    // Load the pdf document
    pdfParser.loadPDF(`./images/${file}`);

    // Parsed the patient
    let patient = await new Promise(async (resolve, reject) => {

      // On data ready
      pdfParser.on("pdfParser_dataReady", (pdfData) => {

        // The raw PDF data in text form
        const raw = pdfParser.getRawTextContent().replace(/\r\n/g, " ");
        // console.log(raw.substring(530,770));

        //771



        // NameSubjectTypeCreditGrade
        const start = raw.indexOf("NameSubjectTypeCreditGrade") + "NameSubjectTypeCreditGrade".length;
        const end = raw.indexOf("The result is provisional")
        const markslist = (raw.substring(start, 1353).split(" "));
        //console.log(raw);
        // console.log(markslist[0].charCodeAt(0)); 819 1353

        const subcode = []
        const grade = []
        const sub = []
        let prv = "";
        let count = 0;

        for (let i of markslist) {
          if (i !== "") {
            let range = i[0].charCodeAt(0) - 48;

            if (range >= 0 && range <= 9) {
              count++;
              let len = ("" + count).length;
              subcode.push(i.substring(0 + len, 10 + len));
              prv += i.substring(10 + len)
            }
            else {
              let ter = i.charCodeAt(i.length - 2) - 48
              // console.log(prv);
              if (ter >= 0 && ter <= 9) {
                let subject = (prv + i);
                sub.push(subject.substring(0, subject.length - 2));
                grade.push(subject.substring(subject.length - 2))
                prv = "";
              }
              else
                prv += i;
            }

          }

        }



        const final = []
        for (let i = 0; i < sub.length; i++)
          final.push({
            subject_code: subcode[i],
            subject_name: sub[i],
            grade: grade[i]
          })
        // console.log(final);
        resolve({
          final
        })



      });

    });

    // Add the patient to the patients array
    patients.push(patient);

  }));

  // Save the extracted information to a json file
  // fs.writeFileSync("patients.json", JSON.stringify(patients));
  return (patients);

};








const storageEngine = multer.diskStorage({
  destination: "./images",
  filename: (req, file, cb) => {
    cb(null, `resume.pdf`);
  },
});

const upload = multer({
  storage: storageEngine,
});

const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};


router.get('/gradelist',async (req,res)=>{
  const resp = await Gradelist.find();

  
  res.send(resp).status(200);

})


router.post("/single", upload.single("image"), async (req, res) => {
  if (req.body) {
    //   console.log(req.file);

    const result = await getPdf();
    const len = result[result.length - 1].final - 1
    // console.log(result[result.length - 1].final);
    const List = new Gradelist({ "Gradelist": result[result.length - 1].final });
    const resp = await List.save();
    //    if(result && fs.existsSync('./images/resume.pdf'))  fs.unlinkSync('./images/resume.pdf')
    res.send(resp)


    //   res.send("Single file uploaded successfully");

  } else {
    res.status(400).send("Please upload a valid image");
  }
});


export default router;
