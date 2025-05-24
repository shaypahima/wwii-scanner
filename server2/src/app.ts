import express from 'express';
import cors from 'cors';
import 'dotenv/config'

import googleDriveRoutes from './routes/googleDriveRoutes'; 
import databaseRoutes from './routes/databaseRoutes';

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/google-drive/documents', googleDriveRoutes);
app.use('/api/database', databaseRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
