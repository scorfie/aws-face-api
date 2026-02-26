import express, { json } from 'express';
import dotenv from 'dotenv';
import { RekognitionClient, CreateFaceLivenessSessionCommand, GetFaceLivenessSessionResultsCommand } from "@aws-sdk/client-rekognition";

dotenv.config();

const app = express();
app.use(json());

const rekognition = new RekognitionClient({ region: "us-east-1", credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY
} });

// 1. Create the session
app.post('/api/create-session', async (req, res) => {
    try {
        const command = new CreateFaceLivenessSessionCommand({});
        const response = await rekognition.send(command);
        res.json({ sessionId: response.SessionId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Retrieve results after the app finishes the scan
app.get('/api/get-results/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const command = new GetFaceLivenessSessionResultsCommand({ SessionId: sessionId });
        const response = await rekognition.send(command);
    
        console.log(response);
        
        // High confidence (e.g., > 85%) usually indicates a real person
        res.json({
            status: response.Status,
            confidence: response.Confidence,
            isLive: response.Confidence > 85
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

app.use(function (req, res, next) {
  res.status(404);
  res.json({
    message: `Cannot ${req.method} ${req.path}`,
    error: 'Not Found',
    statusCode: res.statusCode,
  });
});

app.listen(3000, () => console.log('Backend running on port 3000'));
