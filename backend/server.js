import express from 'express';

const app = express();
app.use(express.static('dist'))

app.get('/api/data', (req, res) => {
    const data = [
        {
            "id": 1,
            "name": "Alpha",
            "score": 92,
            "active": true
        },
        {
            "id": 2,
            "name": "Bravo",
            "score": 76,
            "active": false
        },
        {
            "id": 3,
            "name": "Charlie",
            "score": 88,
            "active": true
        },
        {
            "id": 4,
            "name": "Delta",
            "score": 64,
            "active": false
        },
        {
            "id": 5,
            "name": "Echo",
            "score": 99,
            "active": true
        },
    ]
    res.send(data);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server at http://localhost:${port}`);
});