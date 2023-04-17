class MkdSDK {
  constructor() {
    this._baseurl = "https://reacttask.mkdlabs.com";
    this._project_id = "reacttask";
    this._secret = "d9hedycyv6p7zw8xi34t9bmtsjsigy5t7";
    this._table = "";
    this._custom = "";
    this._method = "";
    this.base64Encode = btoa(`${this._project_id}:${this._secret}`);
    this.token = localStorage.getItem("token");
  }

  setTable(table) {
    this._table = table;
  }

  async login(email, password, role) {
    const response = await fetch(`${this._baseurl}/v1/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project": this.base64Encode,
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      throw new Error("Failed to login");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    this.token = data.token;
    return data.user;
  }

  getHeader() {
    return {
      Authorization: `Bearer ${this.token}`,
      "x-project": this.base64Encode,
    };
  }

  baseUrl() {
    return this._baseurl;
  }

  async callRestAPI(payload, method) {
    const header = {
      "Content-Type": "application/json",
      "x-project": this.base64Encode,
      Authorization: `Bearer ${this.token}`,
    };

    const url = `${this._baseurl}/v1/api/rest/${this._table}/${method}`;

    switch (method) {
      case "GET":
        const response = await fetch(url, {
          method: "POST",
          headers: header,
          body: JSON.stringify(payload),
        });
        const json = await response.json();

        if (response.status === 401 || response.status === 403) {
          throw new Error(json.message);
        }
        return json;

      case "PAGINATE":
        const { page = 1, limit = 10 } = payload;
        const paginateResponse = await fetch(url, {
          method: "POST",
          headers: header,
          body: JSON.stringify({ ...payload, page, limit }),
        });
        const paginateJson = await paginateResponse.json();

        if (paginateResponse.status === 401 || paginateResponse.status === 403) {
          throw new Error(paginateJson.message);
        }
        return paginateJson;

      default:
        break;
    }
  }

  async check(role, action) {
    const response = await fetch(`${this._baseurl}/v1/api/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project": this.base64Encode,
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ role, action, table: this._table }),
    });

    if (!response.ok) {
      throw new Error("Failed to check permission");
    }

    const data = await response.json();
    return data.allowed;
  }
}

export default MkdSDK;
