const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

router.post('/import', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const employees = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      employees.push({
        firstName: row['Prénom'],
        lastName: row['Nom'],
        email: row['Email'],
        phone: row['Téléphone'],
        position: row['Poste'],
        password: row['Mot de passe'],
        planning: row['Planning'], 
      });
    })
    .on('end', async () => {
      try {
        for (const emp of employees) {
          await prisma.employee.create({ data: emp });
        }
        fs.unlinkSync(filePath); 
        res.status(200).send({ message: 'Import réussi' });
      } catch (err) {
        res.status(500).send({ error: 'Erreur d\'importation' });
      }
    });
});
