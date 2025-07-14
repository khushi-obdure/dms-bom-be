import DB from "@/database";

class PlantDaos {
  // Database models
  public plant = DB.Plant;
  public template = DB.Template

  /**
   *
   * @param reqData
   * @returns
   */
  public create = async (reqData: object) => {
    // Validate if reqData is not empty (optional, depending on input handling)
    return await this.plant.create(reqData);
  };

  /**
   *
   * @param plantId
   * @returns
   */
  public findOneById = async (plantId: string) => {
    return await this.plant.findOne({
      where: {
        id: plantId,
      },
    });
  };

  /**
   *
   * @param data
   * @returns
   */
  public findAll = async (data: { [key: string]: any } = {}) => {
    if (Object.keys(data).length) {
      return await this.plant.findAll(data);
    }
    return await this.plant.findAll();
  };

  /**
   *
   * @param id
   * @returns
   */
  public delete = async (plantId: string) => {
    return await this.plant.destroy({
      where: {
        plantId,
      },
    });
  };

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public update = async (plantId: string, data: Object) => {
    return await this.plant.update(data, {
      where: {
        plantId,
      },
    });
  };

  public findAllPlant = async () => {
    return await this.plant.findAll()
  }
}

export default PlantDaos;
