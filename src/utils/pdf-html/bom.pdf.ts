export const getBomPdfHtml = (data) => {
  const bomData = data && data[0] ? data[0] : {};
  const userData = {
    name: bomData.bomMadeByUser?.dataValues?.name || "N/A",
    email: bomData.bomMadeByUser?.dataValues?.email || "N/A",
    employeeCode: bomData.bomMadeByUser?.dataValues?.employeeCode || "N/A",
    department: bomData.bomMadeByUser?.dataValues?.department || "N/A",
    designation: bomData.bomMadeByUser?.dataValues?.designation || "N/A",
    plantName:
      bomData.bomMadeByUser?.PlantModel?.dataValues?.plantName || "N/A",
  };

  const bomDetails = {
    bomId: bomData.bomId || "N/A",
    projectNo: bomData.projectNo || "N/A",
    productNo: bomData.productNo || "N/A",
    productName: bomData.productName || "N/A",
    customerName: bomData.customerName || "N/A",
    dwgNo: bomData.dwgNo || "N/A",
    productGroup: bomData.productGroup || "N/A",
    revisionNo: bomData.revNo || "N/A",
    bomType: bomData.bomType || "N/A",
    model: bomData.model || "N/A",
    customerNo: bomData.customerNo || "N/A",
    sapNo: bomData.sapNo || "N/A",
    ecnEcrNo: bomData.ecnEcrNo || "N/A",
    image: bomData.image || "N/A",
    version: bomData.version || "N/A",
    status: bomData.status || "N/A",
  };

  const bomItems =
    bomData.BomFormDataModals?.map((item, index) => ({
      sno: index + 1,
      childPartNo: item.dataValues?.childPartNo || "N/A",
      childPartName: item.dataValues?.childPartName || "N/A",
      childImage: item.dataValues?.childImage
        ? `<a href="${item.dataValues.childImage}" download style="display: inline-block;">
        <img src="${item.dataValues.childImage}" alt="Child Part" style="width: 40px; height: 40px; cursor: pointer;">
      </a>`
        : "N/A",
      toolingSupplier: item.dataValues?.toolingSupplier || "N/A",
      partSupplier: item.dataValues?.partSupplier || "N/A",
      sapNo: item.dataValues?.sapNo || "N/A",
      dwgNo: item.dataValues?.dwgNo || "N/A",
      surfaceFinish: item.dataValues?.surfaceFinish || "N/A",
      material: item.dataValues?.material || "N/A",
      materialGrade: item.dataValues?.materialGrade || "N/A",
      weight: item.dataValues?.weight || "N/A",
      quantity: item.dataValues?.quantity || "N/A",
      ecnEcNo: item.dataValues?.ecnEcNo || "N/A",
      version: item.dataValues?.version || "N/A",
      remarks: item.dataValues?.remarks || "N/A",
    })) || [];

  const approvalHierarchy =
    bomData.approverData?.map((approver) => ({
      level: approver.currentApproverLevel || "N/A",
      name: approver.approverName || "N/A",
      email: approver.approverEmail || "N/A",
      status: approver.approverStatus || "N/A",
    })) || [];

  const bomApprovalWorkflow =
    bomData.bomApprovalHistory?.map((history) => ({
      level: `${history.dataValues?.senderLevel}${
        history.dataValues?.receiverLevel
          ? ` --> ${history.dataValues?.receiverLevel}`
          : ""
      }`,
      status: `${history.dataValues?.senderStatus || "NA"}`,
      comment: history.dataValues?.senderComment || "NA",
     date: history.dataValues?.createdAt
  ? new Date(history.dataValues.createdAt).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  : "N/A",
    })) || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOM Details Report</title>
    <style>
        /* Your existing CSS here */
        body {
            margin: 0;
            font-family: sans-serif;
            -webkit-print-color-adjust: exact; /* Ensures background colors print */
            color: #333; /* Darker text for better print readability */
            font-size: 0.9rem; /* Slightly reduced base font size */
        }
        *, *::before, *::after {
            box-sizing: border-box;
        }

        /* Utility Classes (based on Tailwind, simplified for HTML/CSS) */
        .flex { display: flex; }
        .justify-end { justify-content: flex-end; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .flex-wrap { flex-wrap: wrap; }
        .flex-row { flex-direction: row; }

        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .gap-9 { gap: 2.25rem; /* 36px */ }

        .w-full { width: 100%; }
        .w-1-2 { width: 50%; }
        .w-60 { width: 15rem; /* 240px */ }

        .rounded { border-radius: 0.25rem; /* 4px */ }
        .rounded-sm { border-radius: 0.125rem; /* 2px */ }
        .shadow-default { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }

        .border { border-width: 1px; border-style: solid; border-color: #e2e8f0; /* border-stroke */ }
        .border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: #e2e8f0; }

        .bg-white { background-color: #ffffff; }
        .bg-blue-600 { background-color: #2563eb; }
        .bg-green-500 { background-color: #22c55e; }
        .text-white { color: #ffffff; }
        .text-blue-950 { color: #172554; }
        .text-black { color: #000000; }
        .text-gray-600 { color: #4b5563; }
        .text-base { font-size: 0.85rem; /* Smaller than 1rem */ }
        .text-lg { font-size: 1rem; /* Smaller than 1.125rem */ }
        .text-xl { font-size: 1.15rem; /* Smaller than 1.25rem */ }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .font-normal { font-weight: 400; }

        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
        .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .p-4 { padding: 1rem; }
        .m-9 { margin: 2.25rem; /* 36px */ }
        /* .mb-3 removed as requested for detail lines */
        .mb-4 { margin-bottom: 1rem; /* 16px */ }
        .mb-5 { margin-bottom: 1.25rem; /* 20px */ }
        .mb-6 { margin-bottom: 1.5rem; /* 24px */ }
        .mt-3 { margin-top: 0.75rem; /* 12px */ }
        .mt-5 { margin-top: 1.25rem; /* 20px */ }
        .ml-2 { margin-left: 0.5rem; /* 8px */ }

        .object-cover { object-fit: cover; }
        .h-18 { height: 4.5rem; /* 72px */ }
        .h-64 { height: 16rem; /* 256px */ }
        .w-64 { width: 16rem; /* 256px */ }

        .overflow-auto { overflow: auto; }
        .scrollable { max-height: fit-content; } /* Adjust as needed for PDF */

        /* Specific styles for download link overlay */
        .group { position: relative; }
        .group .absolute {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            color: #ffffff;
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s ease-in-out;
            text-decoration: none;
        }
        .group:hover .absolute {
            opacity: 1;
        }
        .group .absolute .mr-2 {
            margin-right: 0.5rem;
        }

        /* Table specific styles */
        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
            word-wrap: break-word; /* Allow long words to break */
            table-layout: fixed; /* Ensures fixed column widths are honored */
        }
        th, td {
            padding: 8px 6px; /* Reduced padding for more content */
            border: 1px solid #e2e8f0;
            text-align: left;
            vertical-align: top;
            overflow: hidden; /* Hide overflow content */
            text-overflow: ellipsis; /* Add ellipsis for overflowing text */
        }
        thead tr {
            background-color: #f8fafc;
        }

        /* Print-specific styles for A4 paper and smaller text */
        @media print {
            body {
                margin: 1mm; /* A4 standard margins */
                font-size: 5.5pt; /* Base font size for print - further reduced */
            }

            .grid-cols-1 {
                display: block; /* Ensure blocks stack correctly on print */
            }
            .gap-9 {
                gap: 15px; /* Smaller gap for print */
            }

            /* Adjust text sizes for print - further reduction */
            .text-xl { font-size: 12pt; } /* Main section titles */
            .text-lg { font-size: 8.5pt; }  /* Field labels (e.g., "Name:") */
            .text-base { font-size: 7.5pt; } /* Field values (e.g., "sandeep") */

            /* Reduce padding/margins for print */
            .px-8 { padding-left: 0.75rem; padding-right: 0.75rem; } /* Slightly more compact horizontal padding */
            .py-4 { padding-top: 0.5rem; padding-bottom: 0.5rem; } /* Slightly more compact vertical padding */
            .m-9 { margin: 15px; }

            /* Table print specific styles */
            table {
                page-break-inside: auto; /* Allow the table to break across pages */
            }
            tr {
                /*
                 * Removed page-break-inside: avoid; for rows.
                 * This is often the culprit for rows not showing up on print,
                 * as it prevents the browser from splitting a row across pages,
                 * potentially pushing entire rows off a page if they don't fit.
                 */
                page-break-after: auto;
            }
            thead {
                display: table-header-group; /* Repeat header on each page */
            }
            tfoot {
                display: table-footer-group; /* Repeat footer on each page (if used) */
            }
            th, td {
                font-size: 6.8pt; /* Even smaller font for table content */
                padding: 3px 2px; /* Very compact padding for table cells */
                white-space: normal; /* Allow text to wrap within cells */
            }
            /* Specific column width adjustments if needed, though 'table-layout: fixed' helps */
            th:nth-child(1), td:nth-child(1) { width: 4%; } /* S.No */
            th:nth-child(2), td:nth-child(2) { width: 9%; } /* Child Part No */
            th:nth-child(3), td:nth-child(3) { width: 13%; } /* Child Part Name */
            th:nth-child(4), td:nth-child(4) { width: 7%; } /* Child Image */
            th:nth-child(5), td:nth-child(5) { width: 7%; } /* Tooling Supplier */
            th:nth-child(6), td:nth-child(6) { width: 7%; } /* Part Supplier */
            th:nth-child(7), td:nth-child(7) { width: 7%; } /* SAP No */
            th:nth-child(8), td:nth-child(8) { width: 7%; } /* DWG No */
            th:nth-child(9), td:nth-child(9) { width: 7%; } /* Surface Finish */
            th:nth-child(10), td:nth-child(10) { width: 10%; } /* Material */
            th:nth-child(11), td:nth-child(11) { width: 7%; } /* Material Grade */
            th:nth-child(12), td:nth-child(12) { width: 5%; } /* Weight */
            th:nth-child(13), td:nth-child(13) { width: 5%; } /* Quantity */
            th:nth-child(14), td:nth-child(14) { width: 7%; } /* ECN/ECR No */
            th:nth-child(15), td:nth-child(15) { width: 5%; } /* Version */
            th:nth-child(16), td:nth-child(16) { width: 7%; } /* Remark */
        }
    </style>
</head>
<body>
    <div style="padding: 1rem;">
        <div class="grid grid-cols-1 gap-9">
            <div class="w-full rounded-sm border border-stroke bg-white shadow-default">
                <div class="border-b border-stroke py-4 px-5">
                    <h3 class="font-medium text-blue-950 text-xl">
                        <span style="display: inline-block; vertical-align: middle; margin-right: 8px;">👤</span> User Details
                    </h3>
                </div>
                <div class="flex flex-wrap justify-between px-8 py-4">
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Name:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              userData.name
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Email:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              userData.email
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Employee Code:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              userData.employeeCode
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Department:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              userData.department
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Designation:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              userData.designation
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Plant Name:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              userData.plantName
                            }</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div class="w-full rounded-sm border border-stroke bg-white shadow-default">
                <div class="border-b border-stroke py-4 px-5">
                    <h3 class="font-medium text-blue-950 text-xl">
                        Bom Details
                    </h3>
                </div>
                <div class="flex flex-wrap justify-between px-8 py-4">
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>BOM ID:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.bomId
                            }</span>
                        </h1>
                    </div>
                     <div class="flex w-full w-1-2">
                            <h1 class="text-black text-lg font-semibold">
                                <span>Status:</span>
                                <span class="text-gray-600 text-base color:red font-normal ml-2">${
                                  bomDetails.status
                                }</span>
                            </h1>
                        </div>

                         <div class="flex w-full w-1-2">
                            <h1 class="text-black text-lg font-semibold">
                                <span>Version:</span>
                                <span class="text-gray-600 text-base font-normal ml-2">${
                                  bomDetails.version
                                }</span>
                            </h1>
                        </div>

                       <div class="flex w-full w-1-2">
                            <h1 class="text-black text-lg font-semibold">
                                <span>Project No:</span>
                                <span class="text-gray-600 text-base font-normal ml-2">${
                                  bomDetails.projectNo
                                }</span>
                            </h1>
                        </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Product No:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.productNo
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Product Name:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.productName
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Customer Name:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.customerName
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Dwg No.:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.dwgNo
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Product Group:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.productGroup
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Revision No:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.revisionNo
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>BOM Type:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.bomType
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Model:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.model
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>Customer No.:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.customerNo
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>SAP No.:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.sapNo
                            }</span>
                        </h1>
                    </div>
                    <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <span>ECN/ECR No.:</span>
                            <span class="text-gray-600 text-base font-normal ml-2">${
                              bomDetails.ecnEcrNo
                            }</span>
                        </h1>
                    </div>
                     <div class="flex w-full w-1-2">
                        <h1 class="text-black text-lg font-semibold">
                            <img src="${
                              bomData.image
                            }" alt="Child Part" style="width: 100px; height: 100px;">
                        </h1>
                    </div>
                    <div class="w-full mt-5 overflow-auto scrollable">
                        <h1 class="text-black mb-5 text-xl font-semibold">BOM Items</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>S NO</th>
                                  <th>DWG NO.</th>
                                    <th>CHILD PART NAME</th>
                                    <th>CHILD IMAGE</th>
                                    <th>TOOLING SUPPLIER</th>
                                    <th>PART SUPPLIER</th>
                                    <th>SAP NO.</th>
                                    <th>SURFACE FINISH</th>
                                    <th>MATERIAL</th>
                                    <th>MATERIAL GRADE</th>
                                    <th>WEIGHT</th>
                                    <th>QUANTITY</th>
                                    <th>ECN/EC NO.</th>
                                    <th>VERSION</th>
                                    <th>REMARK</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bomItems
                                  .map(
                                    (item) => `
                                    <tr>
                                        <td>${item.sno}</td>
                                        <td>${item.dwgNo}</td>
                                        <td>${item.childPartName}</td>
                                        <td>${item.childImage}</td>
                                        <td>${item.toolingSupplier}</td>
                                        <td>${item.partSupplier}</td>
                                        <td>${item.sapNo}</td>
                                        <td>${item.surfaceFinish}</td>
                                        <td>${item.material}</td>
                                        <td>${item.materialGrade}</td>
                                        <td>${item.weight}</td>
                                        <td>${item.quantity}</td>
                                        <td>${item.ecnEcNo}</td>
                                        <td>${item.version}</td>
                                        <td>${item.remarks}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="m-9 scrollable">
                    <h1 class="text-black mb-5 text-xl font-semibold">Approval Hierarchy</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>LEVEL</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${approvalHierarchy
                              .map(
                                (entry) => `
                                <tr>
                                    <td>${entry.level}</td>
                                    <td>${entry.name}</td>
                                    <td>${entry.email}</td>
                                    <td>${entry.status}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>

                    <h1 class="text-black mb-5 mt-5 text-xl font-semibold">Bom Approval Workflow</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>LEVEL</th>
                                <th>STATUS</th>
                                <th>COMMENT</th>
                                <th>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bomApprovalWorkflow
                              .map(
                                (workflow) => `
                                <tr>
                                    <td>${workflow.level}</td>
                                    <td>${workflow.status}</td>
                                    <td>${workflow.comment}</td>
                                    <td>${workflow.date}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
};
