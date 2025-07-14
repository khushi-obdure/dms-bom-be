import { v4 as uuidv4 } from "uuid";


const plant_names = [

    {
        id: uuidv4(), plant_name: "AMD WARE HOUSE- JAMALPUR", acronym: "", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": false,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Dharuhera", acronym: "LIL-DHR", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Bawal", acronym: "LIL-BWL", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Bawal Electronics", acronym: "LIL-SMT", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": true,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Sanand -1", acronym: "LIL-SND1", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL - Sanand-2", acronym: "LIL-SND2", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Pantnagar", acronym: "LIL-PNT", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Haridwar", acronym: "LIL-HDW", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Chakan -2", acronym: "LIL-CHK2", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Bangalore", acronym: "LIL-BNG", facility: JSON.stringify([

            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Chinchwad", acronym: "LIL-CHI", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LATL Pantnagar", acronym: "LATL-PNT", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LATL Chakan", acronym: "LIL-CHK1", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LATL - Bangalore, Narsapura", acronym: "LATL-BNG", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LATL - Manesar, Moulding Division", acronym: "LATL-MAN", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LATL - Sahajapur, Aurangabad", acronym: "LATL-SJPR", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LATL - Waluj, Aurangabad", acronym: "LATL-WLJ", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LATL - Chakan, Kuruli", acronym: "LATL-CHK", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": true,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LMAT - Manesar", acronym: "LMAT-MAN", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": true,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LMAT - Gujarat", acronym: "LMAT-GUJ", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LMAT - Bangalore", acronym: "LMAT-BAN", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "Lumax Metallic, PCNDTA Pvt. Ltd. - Bhosari, Pune", acronym: "LUMAX-PCNDTA", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": true,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "Lumax Ituran Telematics Pvt. Ltd. - Gurgaon", acronym: "LUMAX-ITURAN", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LCAT - Chakan Pune", acronym: "LCAT-CHK", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LCAT - Pantnagar", acronym: "LCAT-PNT", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "Lumax Alps Alpine India Pvt. Ltd. - Gurgaon", acronym: "LUMAX-ALPS", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "Lumax FAE Technologies Pvt. Ltd., Gurgaon", acronym: "LUMAX-FAE", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "Lumax JOPP Allied Technologies Pvt. Ltd. - Manesar", acronym: "LJOPP", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "Lumax Yokowo Technologies Pvt. Ltd.", acronym: "LUMAX-YOKOWO", facility: JSON.stringify([
            {
                "Moulding": false,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LAL Bhiwadi", acronym: "LAL-BHI", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LAL Rudrapur", acronym: "LAL-RUDR", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LAL Chakan", acronym: "LAL-CHK", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "LIL Chakan -3", acronym: "LIL-CHK3", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": true,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": false,
                    "NPD /R&D": false
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "IAC Manesar", acronym: "IAC-MAN", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "IAC Bangalore", acronym: "IAC-BAN", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "IAC Nashik", acronym: "IAC-NSK", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "IAC Chakan -1", acronym: "IAC-CHK1", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(), plant_name: "IAC Chakan -2", acronym: "IAC-CHK2", facility: JSON.stringify([
            {
                "Moulding": true,
                "ST": false,
                "Assembly": true,
                "Metal welding": false,
                "Utility(STP/ETP)": true,
                "SMT machines": false,
                "Maintenance": true,
                "Utility Others": true,
                "SCM planning": true,
                "Dispatch": true,
                "Office": {
                    "HR": true,
                    "PURCHASE": true,
                    "FINANCE": true,
                    "ADMIN": true,
                    "MARKETING": true,
                    "NPD /R&D": true
                }
            }
        ]),
        created_at: new Date(),
        updated_at: new Date()
    },
];

export default plant_names;

