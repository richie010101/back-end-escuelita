const express = require('express')
const app = express()
const cors = require('cors');
const sql = require('mssql');
const port = 3006;
app.use(express.json()); 
app.use(cors());


const config = {
  user: 'sa',
  password: 'abc123',
  server: 'RICARDOLAPTOP', // You can use 'localhost\\instance' to connect to named instance // al implementar en el servidor, quitar la parte de sql express, solo mantener el servidor
  database: 'Escuela',
  "options": {
    "encrypt": false,
    "enableArithAbort": false,
    "idleTimeoutMillis": 30000,
  },
  port: 1433
}

app.get('/', (req, res) => {
  res.json({ msg: ('Hola mundo desde servidor') });
})




app.get('/VerMisAlumnos', async (req, res) => { // Cambié a async aquí
  const idMaestro = 1; // Puedes cambiar esto para obtener el ID del maestro desde la solicitud si es necesario

  try {
      let pool = await sql.connect(config);

      // Llamada al procedimiento almacenado
      let result2 = await pool.request()
          .input('IdMaestro', sql.Int, idMaestro) // Asigna el valor al parámetro del procedimiento
          .execute('sp_VerMisAlumnos'); // Llama al procedimiento almacenado

      const datos = result2.recordset;
      console.log(datos);

      res.json({ datos });

  } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Hubo un error' });
  }
});


app.get('/VerAlumnosRegistrar', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    
    // Consulta de alumnos
    let result2 = await pool.request().query(`SELECT * FROM Alumno`);
    const alumnos = result2.recordset;

    // Consulta de materias para el maestro específico
    let result3 = await pool.request().query(`
      SELECT 
        Materia.Nombre_Materia AS Materia,
        Materia.id AS id
      FROM 
        Materia
      INNER JOIN 
        Maestro_Materia ON Materia.id = Maestro_Materia.id_Materia
      INNER JOIN 
        Maestro ON Maestro_Materia.id_Maestro = Maestro.id
      WHERE 
        Maestro.id = 1; -- Reemplaza 1 con el ID del maestro en cuestión
    `);
    const materias = result3.recordset;

    // Devolver ambos resultados en un solo JSON
    res.json({ alumnos, materias });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Hubo un error' });
  }
});

app.post('/EliminarAlumnoMateria', async (req, res) => {
  const { idAlumno, idMateria } = req.body;

  console.log('Datos recibidos:', { idAlumno, idMateria }); // Verifica los datos recibidos

  if (idAlumno === undefined || idMateria === undefined) {
      return res.status(400).json({ msg: 'Faltan parámetros en la solicitud' });
  }

  try {
      let pool = await sql.connect(config);
      await pool.request()
          .input('IdAlumno', sql.Int, idAlumno)
          .input('IdMateria', sql.Int, idMateria)
          .query('DELETE FROM Alumno_Materia WHERE id_Alumno = @IdAlumno AND id_Materia = @IdMateria');

      res.json({ msg: 'Alumno eliminado de la materia correctamente' });

  } catch (error) {
      console.log('Error en la eliminación:', error);
      res.status(500).json({ msg: 'Hubo un error al eliminar al alumno de la materia' });
  }
});

app.post('/AgregarAlumnoMateria', async (req, res) => {
  const { idAlumno, idMateria } = req.body;

  console.log('Datos recibidos para alta:', { idAlumno, idMateria }); // Verifica los datos recibidos

  if (idAlumno === undefined || idMateria === undefined) {
      return res.status(400).json({ msg: 'Faltan parámetros en la solicitud' });
  }

  try {
      let pool = await sql.connect(config);

      // Verificar si la relación ya existe
      const existingRecord = await pool.request()
          .input('IdAlumno', sql.Int, idAlumno)
          .input('IdMateria', sql.Int, idMateria)
          .query('SELECT COUNT(*) AS count FROM Alumno_Materia WHERE id_Alumno = @IdAlumno AND id_Materia = @IdMateria');

      if (existingRecord.recordset[0].count > 0) {
          return res.status(400).json({ msg: 'El alumno ya está registrado en esta materia' });
      }

      // Si no existe, insertar el nuevo registro
      await pool.request()
          .input('IdAlumno', sql.Int, idAlumno)
          .input('IdMateria', sql.Int, idMateria)
          .query('INSERT INTO Alumno_Materia (id_Alumno, id_Materia) VALUES (@IdAlumno, @IdMateria)');

      res.json({ msg: 'Alumno agregado a la materia correctamente' });

  } catch (error) {
      console.log('Error al agregar el alumno a la materia:', error);
      res.status(500).json({ msg: 'Hubo un error al agregar al alumno a la materia' });
  }
});


app.get('/ObtenerDatosMaestro', async (req, res) => {
  const { id } = req.query; // Obtener ID del maestro desde la query string

  try {
      let pool = await sql.connect(config);
      let result = await pool.request()
          .input('Id', sql.Int, id)
          .query(`
              SELECT 
                  Nombre,
                  Apellido,
                  Telefono,
                  Direccion,
                  Correo
              FROM Maestro
              WHERE Id = @Id;
          `);

      const datos = result.recordset[0]; // Obtener el primer registro de la consulta

      if (datos) {
          res.json(datos);
      } else {
          res.status(404).json({ msg: 'Maestro no encontrado' });
      }

  } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Hubo un error al obtener los datos del maestro' });
  }
});



app.post('/ModificarMaestro', async (req, res) => {
  const { id, Nombre, Apellido, Telefono, Direccion, Correo } = req.body;

  try {
      let pool = await sql.connect(config);

      // Actualiza los datos del maestro directamente
      await pool.request()
          .input('Id', sql.Int, id)
          .input('Nombre', sql.NVarChar, Nombre)
          .input('Apellido', sql.NVarChar, Apellido)
          .input('Telefono', sql.NVarChar, Telefono)
          .input('Direccion', sql.NVarChar, Direccion)
          .input('Correo', sql.NVarChar, Correo)
          .query(`
              UPDATE Maestro
              SET Nombre = @Nombre,
                  Apellido = @Apellido,
                  Telefono = @Telefono,
                  Direccion = @Direccion,
                  Correo = @Correo
              WHERE Id = @Id;
          `);

      res.json({ msg: 'Datos del maestro actualizados con éxito' });

  } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Hubo un error al actualizar los datos del maestro' });
  }
});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})