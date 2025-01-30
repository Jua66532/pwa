const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5173;
const SECRET = 'ola';

// Middleware
app.use(express.json());
app.use(cors());

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://juanservin21s:08jimena@cluster0.dpziutc.mongodb.net/authApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conexión exitosa a MongoDB Atlas');
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB Atlas:', err);
});

// Esquema y Modelo de Usuario
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Rutas
// Registro de usuario
app.post('/Register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos' });
  }

  try {
    // Crear un nuevo usuario sin encriptar la contraseña
    const user = new User({ username, password });
    await user.save();

    res.status(201).send('Usuario registrado exitosamente');
  } catch (err) {
    // Manejo de error si ocurre un problema al registrar el usuario
    res.status(400).json({ message: 'Error al registrar usuario', error: err.message });
  }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos' });
  }

  try {
    // Buscar usuario por nombre
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('Usuario no encontrado');

    // Verificar si la contraseña coincide
    if (password !== user.password) {
      return res.status(401).send('Contraseña incorrecta');
    }

    // Generar token
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
