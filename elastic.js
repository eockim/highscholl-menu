var exports = module.exports = {};
const elasticsearch = require('elasticsearch');
exports.connect = new elasticsearch.Client({
  host: 'elasticsearch1:9200',
  log: 'trace'
});
