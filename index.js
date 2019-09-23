const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const cool = require('cool-ascii-faces')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient

const uri = "mongodb+srv://bmbelmi:123143@cluster0-0axha.mongodb.net/test?retryWrites=true&w=majority"




app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/cool', (req, res) => res.send(cool()))


MongoClient.connect(uri, (err, client) => {	
	if (err) return console.log(err)
	db = client.db('notes-database')
	app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

	app.get('/', (req, res) => {
		
		db.collection('my-notes').find().toArray((err, result) => {
			if(err) return console.log(err)
			res.render('pages/index', {notes: result})
		})
	})

	app.post('/insert', (req, res) => {
		db.collection('my-notes').findOne({title:req.body.title}, (err, exist) => {
			if(exist){
				db.collection('my-notes').findOneAndUpdate({title:req.body.title},
					{$set: {note:req.body.note}}, (err, upres) => {
						if(err) return console.log(err)
					})
				console.log("NOTE UPDATED!")
			}
			else{
				req.body.complete=false
				db.collection('my-notes').save(req.body, (err, result) => {
					if(err) return console.log(err)
					console.log("INSERTED TO DATABASE")
				})
			}
			res.redirect('/')
		})
	})

	app.post('/delete', (req, res) => {
		db.collection('my-notes').findOneAndDelete({title: req.body.title}, (err, result) =>{
			if(err) return console.log(err)
			else console.log("DELETED ENTRY")
		})
		res.redirect('/')
	})

	app.post('/toggle', (req, res) => {
		db.collection('my-notes').findOne({title:req.body.title}, (err, result) => {
			if(result.complete == true){
				db.collection('my-notes').findOneAndUpdate({title:req.body.title},
					{$set: {complete:false}}, (err, upres) => {
						if(err) return console.log(err)
					})
			}
			else{
				db.collection('my-notes').findOneAndUpdate({title:req.body.title},
					{$set: {complete:true}}, (err, upres) => {
						if(err) return console.log(err)
					})
			}
			console.log("STATUS TOGGLED!")
			res.redirect('/')
		})
	})

	app.post('/filter', (req, res) => {
		db.collection('my-notes').find().toArray((err, result) => {

			if(err) return console.log(err)
			filtered=result
			if(req.body.tofilter == "complete"){
				filtered=result.filter(entry => entry.complete == true);
			}
			else if(req.body.tofilter == "incomplete"){
				filtered=result.filter(entry => entry.complete == false);
			}

			console.log(filtered)
			res.render('pages/index', {notes: filtered})
		})
	})

})