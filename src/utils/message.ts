const message = {
  general: {
    serverError: "Something went wrong, please try again later.",
    dataNotFound: "Data not found.",
    permissionError:
      "Your permission might have updated, Please contact administrator for more details.",
    fileUploaded: "File uploaded successfully.",
    fileDeleted: "File deleted successfully.",
    invalidFileType: "Invalid file type passed.",
    serviceRuning: "Service is running",
    templateApprovalHierarchy: "Template Approval Hierarchy Not Found."
  },

  users: {
    createUser: "User Created Successfully",
    signup: "Signed up successfully.",
    login: "You are logged in successfully.",
    logout: "You are logged out successfully.",
    dataNotFound: "User data not found.",
    emailExists: "This email is already registered.",
    phoneExists: "This phone number is already registered.",
    invalidCreds: "Invalid username or password.",
    invalidOTP: "Invalid OTP.",
    otpExpired: "Your OTP is expired.",
    invalidEmail: "Your email is not registered.",
    notFound: "User not found.",
    listFetched: "User list fetched successfully.",
    detailsFetched: "User details fetched successfully.",
    created: "Users created successfully.",
    updated: "Users updated successfully.",
    deleted: "Users deleted successfully.",
    userIdRequired: "User Id is required.",
    phoneRequired: "Phone number is required.",
    invalidAuthToken: "Invalid authentication token",
    restrictedUser:
      "User is restricted to perform action, contact administration",
    authTokenNotFound: "Authentication token missing",
    otpSent: "OTP sent to your email.",
    otpNotSent: "Issue in sending OTP to your email, contact administrator.",
    rolesAssigned: "Roles assigned successfully.",
    roleList: "User roles fetched successfully.",
    userNotExists: "User doesn't exists.",
    userDeleted: "User Deleted Successfully",
    documentUpload: "Document Uploaded Successfully!",
    getApprovalHierarchy: "Get Approval Hierarchy Successfully!",
    deleteUser: "User delete successfully",
    approveDocument: "Document Successfully sent for approval!",
    roleNotAllowed: "Role is not allowed!",
    unauthorized: "Unauthorized User!",
    emailAlreadyAssignedToPlant: "Email is already assigned to Plant!",
    differentEmailAssignedToPlant: "Other Email is assigned to this Plant!",
    userId: "User id is required to fetch the user details."
  },

  admin: {
    createAdmin: "Admin Successfully Created.",
    adminDataNotFound: "Admin data not found.",
    adminIdRequired: "Admin id is required.",
    updated: "Admin updated successfully.",
    deleteAdmin: "Admin delete successfully",
    updation: "Super Admin cannot update Plant User.",
    plantAdmin: "Plant Admin cannot update other Plant Admins or Super Admin.",
    noFieldsToUpdate: "No feilds are provided to update!"
  },

  plant: {
    noDataFound: "Plant id doesn't exist",
    getPlant: "Get Plant Data Successfully!",
    plantIdRequired: "Plant Id is required!"
  },

  role: {
    superadminPlant: "Super Admin and Plant Admin are allowed!",
    otherUser: "Only Super Admin, Plant Admin and Plant User are allowed!",
    plantAdmin: "Only Plant Admin is allowed!",
    plantUser: "Only Plant User is allowed!",
    superAdmin: "Only Super Admin is allowed!",
    invalidRole: "Invalid Role",
    dataNotCreated: "Permission data could not be created.",
    savePermissionJson: "Permission JSON saved successfully."
  },

  template: {
    createTemplate: "Template Created Successfully.",
    getTemplate: "Get Template Successfully",
    userNotAllowedInTemplate: "The logged-in user is present in the template's approval hierarchy. Therefore, the user cannot use this template to create the document!",
    deleteTemplate: "Bom Hierarchy Template deleted successfully!",
    templateHierarchyExists: "Template Hierarchy is already created for this plant.",
    updateBomHierarchy: "BOM Template Hierarchy updated successfully.",
    templateHierarchyNotExists: "BOM Template Hierarchy does not exist for this plant.",
    duplicateUsersNotAllowed: "Duplicate users are not allowed in the same hierarchy."
  },

  document: {
    getDocument: "Document Get Successfully!",
    noDocumentApproval: "No Document to be approved by the LoggedIn User!",
    userNotAllowed: "The logged-in user is not allowed to take another user's document reference!",
    failedFetchDocumentData: "Failed to fetch document data!",
    productOrDocFileNotUploaded: "Product Picture or Document File is not Uploaded!"
  },

  approval: {
    errorFetchingApprovalData: "Error fetching approval data with user and document",
    getApproval: "Get Approval Data!",
    userNotAllowed: "The logged-in user is not allowed to Approve, Disapprove or SendBack the document!",
    sendBackNotAllowed: "User is not allowed to SendBack the Document at level 1!",
    documentApprovalAtLevel1: "Document is already approved at Level 1.",
    sendBackNotPending: "SendBack not Pending!",
    invalidApprovalState: "Invalid Approval State!",
    referenceNotAllowedDueToPendingApproval: "User is not allowed to reference the document because its previous version has not been approved at all levels!",
    approverIdNotFound: "No approverId found in the data",
    noPendingDocuments: "No Pending Documents Found!"
  },

  auth: {
    invalidCredentials: "Invalid Credentials!"
  },

  bom: {
    createBOM: "BOM has been created successfully",
    errorInCreatingBOM: "Error while creating the BOM",
    bomDataNotFound: "BOM data not found",
    bomDataFound: "BOM data fetched successfully",
    updateBOMData: "BOM data updated successfully",
    deleteBOMData: "BOM data deleted successfully",
    approvedBom: "BOM successfully approved",
    errorInCreatingBOMHierarchy: "Error while creating the BOM hierarchy",
    createBOMHierarchy: "BOM hierarchy created successfully",
    bomHierarchyDataFound: "BOM hierarchy data fetched successfully",
    bomHierarchyDataNotFound: "BOM hierarchy data not found",
    updateBOMHierarchyData: "BOM hierarchy data updated successfully",
    deleteBOMHierarchyData: "BOM hierarchy deleted successfully",
    actionNotPermitted: "Action not permitted at this level",
    bomApprovalAtLevel1: "BOM is already approved at Level 1.",
    getBomData: "Get BOM Data successfully!",
    bomHierarchyTemplateNotFound: "BOM hierarchy template data not found",

  },

  bomApproval: {
    userNotAllowed: "The logged-in user is not allowed to Approve, Disapprove or SendBack the BOM!",
    sendBackNotAllowed: "User is not allowed to SendBack the Document at level 1!",
  }

};

export { message };
