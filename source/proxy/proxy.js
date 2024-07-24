import express from 'express';
import request from 'request';
const app = express();
 
app.get('/proxy', function(req, res) {
    const imageUrl = req.query.url;
    request({ uri: imageUrl, encoding: null })
        .on('response', function(response) {
            res.set({
                'Content-Type': response.headers['content-type'],
                'Content-Length': response.headers['content-length']
            });
        })
        .pipe(res);
});
 
app.listen(3000);