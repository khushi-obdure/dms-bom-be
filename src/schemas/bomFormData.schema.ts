// src/schemas/bomFormData.schema.ts

/**
 * @openapi
 * components:
 *   schemas:
 *     BomFormDataDTO:
 *       type: object
 *       properties:
 *         mainFinishedPartName:
 *           type: string
 *           description: Name of the main finished part
 *         mainFinishedPartDescription:
 *           type: string
 *           description: Description of the main finished part
 *         createdDate:
 *           type: string
 *           description: Date when the form was created
 *         depth:
 *           type: number
 *           description: Depth value
 *         partName:
 *           type: string
 *           description: Name of the part
 *         sapCode:
 *           type: string
 *           description: SAP code for the part
 *         customerPartNo:
 *           type: string
 *           description: Customer part number
 *         lmatPartNo:
 *           type: string
 *           description: LMAT part number
 *         subAssemblyConditionCompleted:
 *           type: string
 *           description: Condition for sub-assembly completion
 *         supplyConditionCompleted:
 *           type: string
 *           description: Supply condition completion status
 *         materialGradeDetails:
 *           type: string
 *           description: Material grade details
 *         weight:
 *           type: number
 *           description: Weight of the part
 *         quantityPerPart:
 *           type: number
 *           description: Quantity per part
 *         rmSource:
 *           type: string
 *           description: Source of raw material
 *         toolingSupplier:
 *           type: string
 *           description: Supplier of the tooling
 *         partSupplier:
 *           type: string
 *           description: Supplier of the part
 *         machineTonage:
 *           type: string
 *           description: Machine tonnage
 *         cycleTime:
 *           type: number
 *           description: Cycle time for the process
 *         cavity:
 *           type: string
 *           description: Cavity information
 *         remarks:
 *           type: string
 *           description: Any additional remarks
 *       required:
 *         - mainFinishedPartName
 *         - mainFinishedPartDescription
 *         - createdDate
 *         - partName
 *         - sapCode
 *         - customerPartNo
 *         - lmatPartNo
 *         - materialGradeDetails
 *         - weight
 *         - quantityPerPart
 *         - rmSource
 *         - toolingSupplier
 *         - partSupplier
 *         - machineTonage
 *         - cycleTime
 *         - cavity
 *         - remarks
 */
