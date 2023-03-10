class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObject[field]);

    // 1b) Advanced filtering
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedString) => `$${matchedString}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sorting
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitedFields() {
    if (this.queryString.fields) {
      const limitingFields = this.queryString.fields.split(',').join(' ');
      // Projecting
      this.query = this.query.select(limitingFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
