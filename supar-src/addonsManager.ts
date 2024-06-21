export class AddonsManager {
    private addons: any = {};
  
    use(addon: any) {
      this.addons = { ...this.addons, ...addon };
    }
  
    getAddons() {
      return this.addons;
    }
  }