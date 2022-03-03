export class Environment {
  private _map: Map<string, string> = undefined;
  private _dataObj: { [propName: string]: string } = undefined;
  constructor(private propertySources: any[]) {}

  get(key: string, defaultValue?: undefined): string {
    for (const props of this.propertySources) {
      if (props[key] !== undefined && props[key] !== null) {
        return props[key];
      }
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`no default for property [${key}] found`);
  }

  get map(): Map<string, string> {
    if (this._map === undefined) {
      this.createAsMap();
    }
    return new Map<string, string>(this._map);
  }

  get properties(): any {
    if (this._dataObj === undefined) {
      this.createAsProperties();
    }
    return this._dataObj;
  }

  private createAsMap() {
    const properties = new Map();
    const propertyKeys = new Set<string>();
    this.propertySources.forEach(props =>
      Object.getOwnPropertyNames(props).forEach(key =>
        propertyKeys.add(key)
      ));

    propertyKeys.forEach(key => properties.set(key, this.get(key)));

    this._map = properties;
  }

  private createAsProperties() {
    this._dataObj = {};
    this.map.forEach((value, key) => {
      this._dataObj[key] = value;
    });
  }
}
