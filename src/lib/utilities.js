const { readJSON, writeJSON } = require("fs-extra");
const axios = require("axios");

const readDB = async (filePath) => {
  try {
    const fileJson = await readJSON(filePath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const writeDB = async (filePath, fileContent) => {
  try {
    await writeJSON(filePath, fileContent);
  } catch (error) {
    throw new Error(error);
  }
};

const fetchMovieInfo = async (id, key) => {
  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?i=${id}&apikey=${key}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

const fetchMovieSearch = async (title, key) => {
  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?t=${title}&apikey=${key}`
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  readDB,
  writeDB,
  fetchMovieInfo,
  fetchMovieSearch,
};
