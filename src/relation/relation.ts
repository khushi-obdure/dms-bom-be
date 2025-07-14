export const applyRelations = (DB: any) => {
  const {
    User,
    Plant,
    Document,
    Template,
    Approval,
    Role,
    ApprovalsHistory,
    BomFormDataModal,
    BomDataModal,
    BomHierarchyModel,
    BomApprovalsModel,
    BomApprovalHistory
  } = DB;

  Plant.hasMany(User, { foreignKey: "plantId" });
  User.belongsTo(Plant, { foreignKey: "plantId" });

  User.hasMany(Document, { foreignKey: "userId" });
  Document.belongsTo(User, { foreignKey: "userId" });

  Template.hasMany(Document, { foreignKey: "templateId" });
  Document.belongsTo(Template, { foreignKey: "templateId" });

  User.hasMany(Template, { foreignKey: "userId" });
  Template.belongsTo(User, { foreignKey: "userId" });

  Plant.hasMany(Template, { foreignKey: "plantId" });
  Template.belongsTo(Plant, { foreignKey: "plantId" });

  Document.hasMany(Approval, { foreignKey: "documentId" });
  Approval.belongsTo(Document, { foreignKey: "documentId" });

  User.hasMany(Approval, { foreignKey: "approverId" });
  Approval.belongsTo(User, { foreignKey: "approverId" });

  Role.hasMany(User, { foreignKey: "roleId" });
  User.belongsTo(Role, { foreignKey: "roleId" });

  User.hasMany(ApprovalsHistory, { foreignKey: "senderApproverId" });
  ApprovalsHistory.belongsTo(User, { foreignKey: "senderApproverId" });

  User.hasMany(ApprovalsHistory, { foreignKey: "receiverApproverId" });
  ApprovalsHistory.belongsTo(User, { foreignKey: "receiverApproverId" });

  Document.hasMany(ApprovalsHistory, { foreignKey: "documentId" });
  ApprovalsHistory.belongsTo(Document, { foreignKey: "documentId" });

  User.hasMany(BomDataModal, { foreignKey: "userId" });
  BomDataModal.belongsTo(User, { foreignKey: "userId" });

  User.hasMany(BomHierarchyModel, { foreignKey: "userId" });
  BomHierarchyModel.belongsTo(User, { foreignKey: "userId" });

  Plant.hasMany(BomDataModal, { foreignKey: "plantId" });
  BomDataModal.belongsTo(Plant, { foreignKey: "plantId" });

  Plant.hasMany(BomHierarchyModel, { foreignKey: "plantId" });
  BomHierarchyModel.belongsTo(Plant, { foreignKey: "plantId" });

  BomDataModal.hasMany(BomApprovalsModel, { foreignKey: "bomId" });
  BomApprovalsModel.belongsTo(BomDataModal, { foreignKey: "bomId" });

  BomHierarchyModel.hasMany(BomApprovalsModel, { foreignKey: "bomHierarchyId" })
  BomApprovalsModel.belongsTo(BomHierarchyModel, { foreignKey: "bomHierarchyId" })

  BomDataModal.hasMany(BomFormDataModal, { foreignKey: "bomId" });
  BomFormDataModal.belongsTo(BomDataModal, { foreignKey: "bomId" });

  User.hasMany(BomApprovalsModel, { foreignKey: "approverId", });
  BomApprovalsModel.belongsTo(User, { foreignKey: "approverId", });

  BomDataModal.hasMany(BomApprovalHistory, { foreignKey: "bomId" })
  BomApprovalHistory.belongsTo(BomDataModal, { foreignKey: "bomId" })

  User.hasMany(BomApprovalHistory, { foreignKey: "senderApproverId" })
  BomApprovalHistory.belongsTo(User, { foreignKey: "senderApproverId" })

  User.hasMany(BomApprovalHistory, { foreignKey: "receiverApproverId" })
  BomApprovalHistory.belongsTo(User, { foreignKey: "receiverApproverId" })

  BomDataModal.belongsTo(BomDataModal, {
    as: 'parentBom',
    foreignKey: 'parentBomId',
  });

  BomDataModal.hasMany(BomDataModal, {
    as: 'childBoms',
    foreignKey: 'parentBomId',
  });

};
