exports.DATABASE_URL = process.env.DATABASE_URL ||
                      'mongodb://localhost/dreamJournalSeedDB';
//exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
//                      'mongodb://localhost/dreamJournalTestDB';
exports.PORT = process.env.PORT || 8080;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '1d';