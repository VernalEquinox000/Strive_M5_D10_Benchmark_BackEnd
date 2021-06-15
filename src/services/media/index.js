const express = require("express");
const path = require("path");
const uniqid = require("uniqid");
const { readDB, writeDB, fetchMovieInfo } = require("../../lib/utilities");
const { check, validationResult } = require("express-validator");
const { Router } = require("express");
const { read } = require("fs");
const { timeStamp } = require("console");
const mediaFilePath = path.join(__dirname, "movies.json");

const mediaRouter = express.Router();

const mediaValidation = [
  check("Title").exists().withMessage("Title is required!"),
  check("imdbID").exists().withMessage("id is required!"),
];

const reviewsValidation = [
  check("rate").exists().withMessage("Rate is required!"),
  check("comment").exists().withMessage("Comment is required!"),
];

//GET media
mediaRouter.get("/", async (req, res, next) => {
  try {
    const movies = await readDB(mediaFilePath);
    /* console.log(req.query);
    console.log(req.query.title);
    if ((req.query && req.query.title) || req.query.year || req.query.type) {
      const filteredMovies = movies.filter(
        (movie) =>
          (movie.hasOwnProperty("Title") &&
            movie.Title.toLowerCase() === req.query.title.toLowerCase()) ||
          movie.Year === req.query.year ||
          movie.Type === req.query.type
      );
      //need to add sort by avg rate
      res.send(filteredMovies);
    } else {
      res.send(movies);
    } */

    /* for (let i = 0; i < movies.length; i++) {
      let counter = 0;
      let avg = [];
      for (let j = 0; j < movies[i].reviews.length; j++) {
        counter += movies[i].reviews[j].rate;
        avg[i] = counter / (j + 1);
      }
      movies[i].reviews.average = avg[i];
    } */
    const sortedMovies = movies.sort((a, b) => {
      if (a.year < b.year) return -1;
      else if (a.year > b.year) return 1;
      else return 0;
    });
    console.log(sortedMovies);
    res.send(sortedMovies);
  } catch (error) {
    next(error);
  }
});

//GET media/:id
mediaRouter.get("/:movieId", async (req, res, next) => {
  try {
    const movies = await readDB(mediaFilePath);
    const selectedMovie = movies.filter(
      (movie) => movie.imdbID === req.params.movieId
    );
    if (movies.length > 0) {
      const response = await fetchMovieInfo(
        req.params.movieId,
        process.env.API_KEY
      );
      const data = await response.data;
      res.send(data);
      //res.send(selectedMovie);
      //const movieInfo = await response.json;
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

// POST media
/* test with:
    "Title": "Avengers: Age of Ultron",
    "Year": "2015",
    "imdbID": "tt2395427",
    "Type": "movie",
    "Poster": "https://m.media-amazon.com/images/M/MV5BMTM4OGJmNWMtOTM4Ni00NTE3LTg3MDItZmQxYjc4N2JhNmUxXkEyXkFqcGdeQXVyNTgzMDMzMTg@._V1_SX300.jpg"
 */
mediaRouter.post("/", mediaValidation, async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const error = new Error();
      error.httpStatusCode = 400;
      error.message = validationErrors;
      next(error);
    } else {
      const movies = await readDB(mediaFilePath);

      movies.push({
        ...req.body,
        reviews: [],
      });
      await writeDB(mediaFilePath, movies);
      res.status(201).send();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//PUT
mediaRouter.put("/:id", mediaValidation, async (req, res, next) => {
  try {
    const movies = await readDB(mediaFilePath);
    const newMovies = movies.filter((movie) => movie.imdbID !== req.params.id);
    const modifiedMovie = req.body;
    modifiedMovie.imdbID = req.params.id;
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      let error = new Error();
      error.message = error.details[0].message;
      error.httpStatusCode = 400;
      next(error);
    } else {
      newMovies.push(modifiedMovie);
      await writeDB(mediaFilePath, newMovies);
      res.status(200).send(modifiedMovie);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// DELETE media/:id
mediaRouter.delete("/:id", async (req, res, next) => {
  try {
    const movies = await readDB(mediaFilePath);

    const movieFound = movies.find((movie) => movie.imdbID === req.params.id);

    if (movieFound) {
      const filteredMovies = movies.filter(
        (movie) => movie.imdbID !== req.params.id
      );

      await writeDB(mediaFilePath, filteredMovies);
      res.status(204).send();
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET media/id/reviews
mediaRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const movies = await readDB(mediaFilePath);

    const movieFound = movies.find((movie) => movie.imdbID === req.params.id);

    if (movieFound) {
      res.send(movieFound.reviews);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET media/id/reviews/id
mediaRouter.get("/:movieId/reviews/:reviewId", async (req, res, next) => {
  try {
    const movies = await readDB(mediaFilePath);

    const movieFound = movies.find(
      (movie) => movie.imdbID === req.params.movieId
    );

    if (movieFound) {
      const reviewFound = movieFound.reviews.find(
        (review) => review._id === req.params.reviewId
      );
      if (reviewFound) {
        res.send(reviewFound);
      } else {
        const error = new Error();
        error.httpStatusCode = 404;
        next(error);
      }
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

mediaRouter.post(
  "/:movieId/reviews",
  reviewsValidation,
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = validationErrors;
        next(error);
      } else {
        const movies = await readDB(mediaFilePath);
        const movieFound = movies.find(
          (movie) => movie.imdbID === req.params.movieId
        );
        console.log(movieFound);

        movieFound.reviews.push({
          _id: uniqid(),
          ...req.body,
          elementId: req.params.movieId,
          createdAt: new Date(),
        });
        await writeDB(mediaFilePath, movies);
        res.status(201).send("ok");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

mediaRouter.put(
  "/:movieId/reviews/:reviewId",
  reviewsValidation,
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = validationErrors;
        next(error);
      } else {
        const movies = await readDB(mediaFilePath);
        const foundMovie = movies.find(
          (movie) => movie.imdbID === req.params.movieId
        );
        if (foundMovie) {
          const filteredReviews = foundMovie.reviews.filter(
            (review) => review._id !== req.params.reviewId
          );

          const modifiedReview = {
            ...req.body,
            _id: req.params.reviewId,
            elementId: req.params.movieId,
            modifiedAt: new Date(),
          };
          console.log(modifiedReview);
          filteredReviews.push(modifiedReview);
          foundMovie.reviews = filteredReviews;
          /* const newMovies = movies.filter(
            (movie) => movie.imdbID !== req.params.movieId
          );
          const newestMovies = newMovies.push({ foundMovie });
          console.log(newestMovies); */
          await writeDB(mediaFilePath, movies);
          res.status(200).send(filteredReviews);
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

mediaRouter.delete("/:movieId/reviws/:reviewId", async (req, res, next) => {
  try {
    const movies = await readDB(mediaFilePath);
    const movieFound = movies.find(
      (movie) => movie.imdbID === req.params.movieId
    );
    if (movieFound) {
      const reviewFound = movieFound.reviews.find(
        (review) => review._id === req.params.reviewId
      );
      if (reviewFound) {
        const filteredReviews = movieFound.reviews.filter(
          (review) => review._id !== req.params.reviewId
        );
        await writeDB(mediaFilePath, filteredReviews);
        res.status(204).send("review Deleted!");
      } else {
        const error = new Error();
        error.httpStatusCode = 404;
        next(error);
      }
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = mediaRouter;
