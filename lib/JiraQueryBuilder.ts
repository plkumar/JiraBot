'use strict';

/**
 * Create a new JiraQueryBuilder.
 *
 * @option {Jira} jira jira instance for making requests
 * @api public
 */

class JiraQueryBuilder {

  _jira: any;
  _where: String[];
  _order: String[];
  _query: String;

  constructor(jira?: any) {
    this._jira = jira;
    this._where = [];
    this._order = [];
  }

  /**
   * Quote a JQL value. Doesn't quote already quoted string, so safe to use for
   * all values.
   *
   * @param {String} str string to quote
   * @return {String} quoted string
   * @api public
   */

  quote(str: String) {
    return str && typeof str === 'string' && str.indexOf(' ') > 0 && str.indexOf('"') < 0 && ('"' + str + '"') || str;
  };

  /**
   * Add a filter to the where clause.
   *
   * @param {String} key column to filter on
   * @param {String} value value to filter
   * @api public
   */

  where(key: String, value: String) {
    value !== undefined && this._where.push(this.quote(key) + ' = ' + this.quote(value));
    return this;
  }

  /**
   * Add a contains filter to the where clause.
   *
   * @param {String} key column to filter on
   * @param {String...} values remaining parameters joined as values to filter
   * @api public
   */

  whereIn(key: String) {
    var value = Array.prototype.constructor.apply(null, arguments).slice(1);
    value = value.length > 1 ? '(' + value.map(this.quote).join(', ') + ')' : this.quote(value[0]);
    this._where.push(this.quote(key) + ' in ' + value);
    return this;
  }

  /**
   * Add multiple where filters, or'd together. Accepts any number of arguments,
   * in pairs. First (and odd) arguments are keys, second (and even) arguments
   * are values.
   *
   * @api public
   */

  any() {
    var arr = [];
    for (var i = 0; i < arguments.length; i += 2) {
      arguments[i + 1] && arr.push(this.quote(arguments[i]) + ' = ' + this.quote(arguments[i + 1]));
    }
    arr.length && this._where.push('(' + arr.join(' OR ') + ')');
    return this;
  };

  /**
   * Add to the order clause.
   *
   * @api public
   */

  orderBy() {
    this._order = Array.prototype.concat.apply(this._order, arguments);
    return this;
  };

  /**
   * Set or return the query.
   *
   * @param {String} [query] set the query to run
   * @return if query is given, this, otherwise the query
   * @api public
   */

  query(query?: String): JiraQueryBuilder | String {
    if (!query) {
      this._query = this._where.join(' AND ');
      this._order.length && (this._query += ' ORDER BY ' + this._order.join(', '));
      return this._query;
    }
    this._query = query;
    return this;
  };

  /**
   * Run the query.
   *
   * @param {Function} fn callback function, receives (err, response, json)
   * @return {Request} the request
   * @api public
   */

  run(fn) {
    return this._jira.request(
      '/search',
      {
        qs: {
          jql: this.query(),
          fields: '*all'
        }
      },
      function (err, res, body) {
        if (!err && typeof body === 'object') {
          body = body.issues.map(function (json) {
            return new this._jira.Issue(this._jira, json);
          }, this);
        }
        fn && fn(err, res, body);
      }.bind(this)
    );
  };
}

export = JiraQueryBuilder;