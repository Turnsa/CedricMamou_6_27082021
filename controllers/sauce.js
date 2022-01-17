const Sauce = require('../models/sauce');
const fs = require('fs');

// Récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then (sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};

// Récupération d'une seule sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then (sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Création d'une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
};

// Modification d'une sauce
exports.modifySauce = (req, res, next) => {
const sauceObject =req.file ?
  { 
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  Sauce.updateOne ({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
  .then(() => res.status(200).json ({ message: 'Sauce modifiée !'}))
  .catch(error => res.status(400).json ({ error }));
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
          if (!sauce) {
              res.status(404).json({
                error: new Error('No such Sauce!')
              });
          }
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
              Sauce.deleteOne({ _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                  .catch(error => res.status(400).json({ error }));
          });
      })
    .catch(error => res.status(500).json({ error })); 
};

// Like ou dislike de sauce
exports.likedSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
          if (req.body.like == 1) {
              sauce.usersLiked.push(req.body.userId);
              Sauce.updateOne({ _id: req.params.id }, {
                  sauce,
                  usersLiked: sauce.usersLiked,
                  likes: sauce.usersLiked.length
              })
                  .then(() => res.status(200).json({ message: "Sauce likée !" }))
                  .catch(error => res.status(400).json({ error }));
          } else if (req.body.like == -1) {
              sauce.usersDisliked.push(req.body.userId);
              Sauce.updateOne({ _id: req.params.id }, {
                  sauce,
                  usersDisliked: sauce.usersDisliked,
                  dislikes: sauce.usersDisliked.length
              })
                  .then(() => res.status(200).json({ message: "Sauce dislikée !" }))
                  .catch(error => res.status(400).json({ error }));
          } else if (req.body.like == 0) {
              if (sauce.usersLiked.includes(req.body.userId)) {
                  let indexUserLiked = sauce.usersLiked.indexOf(req.body.userId);
                  sauce.usersLiked.splice(indexUserLiked, 1);
                  Sauce.updateOne({ _id: req.params.id }, {
                      sauce,
                      usersLiked: sauce.usersLiked,
                      likes: sauce.usersLiked.length
                  })
                      .then(() => res.status(200).json({ message: "Like supprimé !" }))
                      .catch(error => res.status(400).json({ error }));
              } else if (sauce.usersDisliked.includes(req.body.userId)) {
                  let indexUserDisliked = sauce.usersDisliked.indexOf(req.body.userId);
                  sauce.usersDisliked.splice(indexUserDisliked, 1);
                  Sauce.updateOne({ _id: req.params.id }, {
                      sauce,
                      usersDisliked: sauce.usersDisliked,
                      dislikes: sauce.usersDisliked.length
                  })
                      .then(() => res.status(200).json({ message: "Dislike supprimé !" }))
                      .catch(error => res.status(400).json({ error }));
              }
          }
      })
      .catch(error => res.status(500).json({ error }));
};