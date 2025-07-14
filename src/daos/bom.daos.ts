import { Model, Op, where } from "sequelize";

import DB from "@/database";
import { constants } from "@/utils/constant";
import { BomApproval } from "@/interfaces/bom-approval.interface";
import { BomHierarchyInterface } from "@/interfaces/bom.hierarchy.interface";

class BomFormDataDao {
  public user = DB.User;
  public plantModel = DB.Plant;
  public bomFormData = DB.BomFormDataModal;
  public bom = DB.BomDataModal;

  public bomHierarchyModel = DB.BomHierarchyModel;
  public bomApprovalModel = DB.BomApprovalsModel;

  /**
   *
   * @param payloadData
   * @returns
   */
  public create = async (payloadData: object, image, drawing) => {
    const createData = { ...payloadData, image, drawing }
    return await this.bom.create(createData);
  };

  /**
   *
   * @param id
   * @returns
   */
  public getById = async (id: string | string[], bomForm = false) => {
    if (Array.isArray(id)) {
      return await this.bom.findAll({
        where: { id: { [Op.in]: id } },
        include: bomForm ? [{ model: this.bomFormData }] : undefined,
      });
    } else {
      const result = await this.bom.findOne({
        where: { id },
        include: bomForm ? [{ model: this.bomFormData }] : undefined,
      });
      return result ? [result] : [];
    }
  };

  /**
   *
   * @param where
   * @param limit
   * @param offset
   * @param sort
   * @param order
   * @returns
   */
  public filterData = async (where, pageSize, offset, sortBy, sortOrder) => {
    return await this.bom.findAndCountAll({
      where,
      include: [
        {
          model: this.bomFormData,
          required: false,
        },
        {
          model: this.bomApprovalModel,
          required: false,
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],
      limit: pageSize,
      offset,
      order: [
        [sortBy, sortOrder.toUpperCase()],
        [{ model: this.bomApprovalModel }, "current_approver_level", "ASC"],
      ],
    });
  };

  /**
   * 
   * @param where 
   * @param pageSize 
   * @param offset 
   * @param sortBy 
   * @param sortOrder 
   * @returns 
   */
  public reviewBom = async (where, pageSize, offset, sortBy, sortOrder) => {
    return await this.bomApprovalModel.findAndCountAll({
      where,
      include: [
        {
          model: this.bom,
          required: false,
          include: [
            {
              model: this.bomFormData,
              required: false,
            },
            {
              model: this.user,
            },
          ],
        },
      ],
      limit: pageSize,
      offset,
      order: [
        [sortBy, sortOrder.toUpperCase()],
      ],
    });
  };

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public update = async (id: string, data: object) => {
    return await this.bom.update(data, {
      where: { id },
      returning: true, // Ensure it returns the updated data
    });
  };

  public createOrUpdate = async (id: string, data: any) => {
    console.log(data, '===data')

    const dataToUpdate = {
      ...data.bomDetails,
      image: data.image
    }

    // Update BOM Details
    if (data.bomDetails) {
      await this.bom.update(dataToUpdate, { where: { id } });
    }

    // Process BOM Form rows
    if (data.bomForm && typeof data.bomForm === 'object') {
      const bomFormRows = Object.keys(data.bomForm)
        .filter(key => !isNaN(Number(key)))
        .map(key => data.bomForm[key]);

      for (const row of bomFormRows) {
        const where = { sNo: row.sNo, bomId: id };

        const [bomFormEntry, created] = await this.bomFormData.findOrCreate({
          where,
          defaults: {
            ...row,
            bomId: id
          }
        });

        if (!created) {
          await bomFormEntry.update({ ...row });
        }
      }
    }

    // Fetch all bomFormData for this bomId
    const allForms = await this.bomFormData.findAll({ where: { bomId: id } });

    const response = {
      bomDetails: await this.bom.findByPk(id),
      bomForm: allForms.map(form => ({
        ...form.toJSON(),
      })).sort((a, b) => Number(a.sNo) - Number(b.sNo))
    };

    return response;
  };

  /**
   *
   * @param id
   * @returns
   */
  public delete = async (id: string) => {
    return await this.bom.destroy({
      where: { id },
      force: true,
    });
  };

  //---- bom hierarchy
  /**
   *
   * @param data
   * @returns
   */
  public createBomHierarchy = async (data: BomHierarchyInterface) => {
    return await this.bomHierarchyModel.create(data);
  };

  /**
   *
   * @param data
   * @returns
   */
  public createBulkBomHierarchy = async (data: BomHierarchyInterface[]) => {
    return await this.bomHierarchyModel.bulkCreate(data);
  };

  /**
   *
   * @param id
   * @returns
   */
  public getBomHierarchyById = async (id: string | string[]) => {
    if (Array.isArray(id)) {
      return await this.bomHierarchyModel.findAll({
        where: { id: { [Op.in]: id } },
      });
    } else {
      const result = await this.bomHierarchyModel.findOne({
        where: { id },
      });
      return result ? [result] : [];
    }
  };

  /**
   *
   * @param plantId
   * @returns
   */
  public getBomHierarchyByPlantId = async (plantId: string) => {
    return await this.plantModel.findAll({
      include: [
        {
          model: this.bomHierarchyModel,
          where: { plantId },
          order: [["level", "ASC"]],
          include: [
            {
              model: this.user,
              attributes: {
                exclude: [
                  "plantId",
                  "plantName",
                  "roleId",
                  "passwordHash",
                  "role",
                  "isLoggedIn",
                  "createdAt",
                  "updatedAt",
                ],
              },
            },
          ],
        },
      ],
    });
  };

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public updateBomHierarchy = async (
    id: string,
    data: BomHierarchyInterface
  ) => {
    await this.bomHierarchyModel.update(data, {
      where: { id },
    });
    return await this.getBomHierarchyById(id);
  };

  /**
   *
   * @param id
   * @returns
   */
  public deleteBomHierarchy = async (id: string) => {
    return await this.bomHierarchyModel.destroy({
      where: { id },
      force: true,
    });
  };

  /**
   *
   * @returns
   */
  public generateBomId = async () => {
    const lastEntry = await this.bom.findOne({
      order: [["bomId", "DESC"]],
      attributes: ["bomId"],
      limit: 1,
    });

    if (lastEntry && lastEntry.bomId) {
      const lastIdNumber = parseInt(lastEntry.bomId, 10);
      const newIdNumber = lastIdNumber + 1;
      return newIdNumber.toString().padStart(5, "0");
    } else {
      return constants.BOM_ID;
    }
  };

  //---- bom approval
  /**
   *
   * @param payload
   * @returns
   */
  public createBulkApproval = async (payload: BomApproval[]) => {
    return await this.bomApprovalModel.bulkCreate(payload);
  };

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public updateBomApproval = async (id, data: object) => {
    const [affectedCount, updatedRecords] = await this.bomApprovalModel.update(
      data,
      {
        where: { id },
        returning: true,
      }
    );
    return await this.getBomApproval(id);
  };

  /**
   *
   * @param bomId
   * @param data
   * @returns
   */
  public updateBomApprovalWithBomId = async (bomId, data: object) => {
    return await this.bomApprovalModel.update(data, {
      where: { bomId },
      returning: true,
    });
  };

  /**
   *
   * @param id
   * @returns
   */
  public getBomApproval = async (id: string | string[]) => {
    if (typeof id === "string") {
      return [
        await this.bomApprovalModel.findOne({
          where: {
            id,
          },
          include: [
            {
              model: this.user,
            }
          ]
        }),
      ];
    } else {
      return await this.bomHierarchyModel.findAll({
        where: { id: { [Op.in]: id } },
      });
    }
  };

  /**
   *
   * @param bomId
   * @returns
   */
  public getBomApprovalWithBomId = async (bomId: string) => {
    return await this.bomApprovalModel.findAll({
      where: {
        bomId,
      },
      include: [
        {
          model: this.bom,
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],
      order: [["currentApproverLevel", "ASC"]],
    });
  };

  /**
   *
   * @param bomId
   * @returns
   */
  public deleteBomApprovalWithBomId = async (bomId: string) => {
    return await this.bomApprovalModel.destroy({
      where: { bomId },
      force: true,
    });
  };

  /**
   *
   * @returns
   */
  public plantHierarchy = async () => {
    return await this.plantModel.findAndCountAll({
      include: [
        {
          model: this.bomHierarchyModel,
          order: [["level", "ASC"]],
          include: [
            {
              model: this.user,
            },
          ],
        },
      ],
    });
  };

  //---bom formData
  /**
   *
   * @param payload
   * @returns
   */
  public createBomFormDataBulk = async (payload) => {
    return await this.bomFormData.bulkCreate(payload);
  };

  /**
   *
   * @param payload
   * @param id
   * @returns
   */
  public updateFormData = async (payload, id) => {
    return await this.bomFormData.update(payload, {
      where: {
        id,
      },
    });
  };

  /**
   *
   * @param bomId
   * @param id
   * @returns
   */
  public deleteFormData = async (bomId, id) => {
    let where: any = {};
    if (bomId) {
      where.bomId = bomId;
    } else {
      where.id = id;
    }
    return await this.bomFormData.destroy({
      where,
      returning: true,
    });
  };

  public updateBomStatus = async (updateDocument: object, bomId: string) => {
    return await this.bom.update(
      updateDocument,
      { where: { id: bomId } }
    )
  }

  public insertBomFormData = async (bomForm) => {
    return await this.bomFormData.bulkCreate(bomForm)
  }


  /**
   *
   * @param plantId
   * @returns
   */
  public deleteBomHierarchyTemplate = async (plantId: string) => {
    return await this.bomHierarchyModel.destroy({
      where: { plantId },
      force: true,
    });
  };

  /**
   *
   * @param id
   * @returns
   */
  public getBomHierarchyTemplate = async (plantId: string) => {
    return await this.bomHierarchyModel.findAll({
      where: { plantId },
    });
  };

  public getHierarchyCount = async (plantId) => {
    return await this.bomHierarchyModel.count({ where: { plantId } })
  }

  public get = async (id) => {
    return await this.bom.findOne({ where: { id }, raw: true })
  }

  public getBomStatusActivity = async (limit, plantId) => {
    return this.bom.findAndCountAll({
      where: { plantId },
      include: [
        {
          model: this.user,
          attributes: ['name', 'email', 'employeeCode', 'department', 'designation']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
    })
  }

  public getHierarchyLevelMap = async (plantIds) => {
    const results = await this.bomHierarchyModel.findAll({
      where: { plantId: { [Op.in]: plantIds } },
      attributes: ['plantId', 'level']
    });

    return results.reduce((map, row) => {
      const currentLevel = map[row.plantId] || 0;
      map[row.plantId] = Math.max(currentLevel, row.level);
      return map;
    }, {});
  }

}

export default BomFormDataDao;
