var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {

    articleData: (req: any, res: any) => {
        var response = req.body.reponse;

        return res.status(200).send({
            response
        });
    },

    test: (req: any, res: any) => {
        return res.status(200).send({
            message: 'Works correctly!'
        });
    },

    save: (req: any, res: any) => {
        //Get parameters from post
        var params = req.body;
        //Validate data with validator
        try {
            //We assign the title while the data is not empty
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Missing data',
            });
        }
        if (validate_title && validate_content) {
            //Create object
            var article = new Article();

            //Assign values
            article.title = params.title;
            article.content = params.content;

            if (params.image) {
                article.image = params.image;
            } else {
                article.image = null;
            }

            //Save article
            article.save((err: any, articleStored: any) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'Article not saved.'
                    });
                }
                //Return response
                return res.status(200).send({
                    status: 'success',
                    message: 'Saved correctly.',
                    article: articleStored
                });

            })

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Data not valid!'
            });
        }
    },

    getAllArticles: (req: any, res: any) => {
        var query = Article.find({});

        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
        }

        // Find
        query.sort('-_id').exec((err: any, articles: any) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos !!!'
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    },

    getArticle: (req: any, res: any) => {
        // Get the article id from url
        var articleId = req.params.id;

        //Check if exists
        if (!articleId || articleId == null) {
            return res.status(500).send({
                status: 'error',
                message: 'Article does not exist'
            });
        }

        //Search the article
        Article.findById(articleId, (err: any, article: any) => {

            if (err || !article) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error finding the article'
                });
            }

            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },

    update: (req: any, res: any) => {
        //Get id of the article from url
        var articleId = req.params.id;

        //Get data from the put
        var params = req.body;

        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Missing data'
            });
        }

        if (validate_title && validate_content) {
            //Find and update
            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err: any, articleUpdated: any) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error while updating the article.'
                    });
                }
                if (!articleUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'The article does not exists.'
                    });
                }
                return res.status(200).send({
                    status: 'error',
                    message: 'The validation is correct',
                    article: articleUpdated
                });

            });
        } else {
            return res.status(200).send({
                status: 'error',
                message: 'The validation is no correct'
            });
        }
    },
    delete: (req: any, res: any) => {
        //Get id of the article from url
        var articleId = req.params.id;

        //Find and delete
        Article.findOneAndDelete({ _id: articleId }, (err: any, articleRemoved: any) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error while deleting the article.'
                });
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status: 'error',
                    message: 'The article does not exists.'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });
        });
    },

    upload: (req: any, res: any) => {
        //Config connect multi party module router
        //Get the file of petition
        var file_name:any = 'Image not uploaded...';
        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        //Get  name and extension of the file
        var file_path = req.files.file0.path;

        //Esto en Windows
        //var file_split = file_path.split('\\');
        //Esto en Linux o MAC
        var file_split = file_path.split('/');

        //Name of the archive
        var file_name = file_split[2];

        //Extension of the archive
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];
        // Comprobar la extension, solo imagenes, si es valida borrar el fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            
            // borrar el archivo subido
            fs.unlink(file_path, (err:any) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'The file extension is not supported',
                    ext: file_ext
                });
            });
        
        }else{
             // Si todo es valido, sacando id de la url
             var articleId = req.params.id;

             if(articleId){
                // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new:true}, (err:any, articleUpdated:any) => {

                    if(err || !articleUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Error while saving the image article.'
                        });
                    }

                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
             }else{
                return res.status(200).send({
                    status: 'success',
                    image: file_name
                });
             }
            
        }
    },

    getImage: (req:any, res:any) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists:any) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe !!!'
                });
            }
        });
    },

    search: (req:any, res:any) => {
        // Sacar el string a buscar
        var searchString = req.params.search;

        // Find or
        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err:any, articles:any) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición !!!'
                });
            }
            
            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No matches'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    }

}

module.exports = controller;