const Ap_invoices = require("../Models/Ap_invoices")
const Vendors = require('../Models/Vendors'); 
const mongoose = require("mongoose")
const {ap_invoicesShema} = require("../Controllers/Validation/ap_invoicesValidation")

const addAp_invoices = async (req, res) => {
    try {
        const {error, value} = ap_invoicesShema.validate(req.body, {abortEarly: false, stripUnknown: true})

        const {invoice_number, invoice_date, due_date, subtotal, status, tax_amount, total_amount, paid_amount, vendor_id, journal_id, period_id} = value

        if(error) return res.status(400).json({msg: error.details.map(err => err.message)})

        const ap_invoices = await Ap_invoices.findOne({invoice_number})

        if(ap_invoices) return res.status(400).json({msg: "Accounts Payable Invoice Already Exist"})

        const invoices = await Ap_invoices.create({invoice_date, due_date, subtotal, status, tax_amount, total_amount, paid_amount, vendor_id, journal_id, period_id})

        res.status(201).json({msg: "Accounts Payable Invoice Created Successfully", data: invoices})

    } catch (error) {
        res.status(500).json({msg: "Server Error", error: error.message});
    }
}

const getallAp_invoices = async (req, res) => {
   try {

    const ap_invoices = await Ap_invoices.find();
        
    res.status(200).json({msg:"All Accounts Payable Invoice Retrived", ap_invoices})
        
   } catch (error) {
        res.status(500).json({msg: "Server Error",error: error.message}) 
   }
}

const getJAPById = async (req, res) => {
    try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: "ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid ID" });
    }

    const data = await Ap_invoices.findById(id);

    if (!data) {
      return res.status(404).json({ msg: "Account Payable Invoice not found" });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
}

const getJAPByStatus = async (req, res) => {
    try {

    const { status } = req.params;

    if (!status) {
      return res.status(400).json({ msg: "Status is required" });
    }

    const data = await Ap_invoices.find({status: status});

    if (!data) {
      return res.status(404).json({ msg: "Account Payable Invoice not found", data });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
}

const updatestatus = async (req,res) => {
    try {

      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
       return res.status(400).json({ msg: "Account Payable Invoice ID is required" });
      }

      const ap_invoices = await Ap_invoices.findByIdAndUpdate(id,{ status },{new: true});

      if (!ap_invoices) {
       return res.status(404).json({ msg: "Account Payable Invoice not found" });
      }

      res.status(200).json({msg: "Status Updated successfully", Ap_invoices: ap_invoices});

    } catch (error) {
        res.status(500).json({msg: "Server Error",error: error.message}) 
    }
}

const getVendorAgingSummary = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Invalid Vendor ID" });
        }

        const vendor = await Vendors.findById(id);
        if (!vendor) {
            return res.status(404).json({ msg: "Vendor not found" });
        }

        const asOfDate = new Date();

        const invoices = await Ap_invoices.find({vendor_id: id, status: { $in: ["PENDING", "APPROVED"] }});

        let totalOutstanding = 0;

        const aging = {
            current: 0,         
            "1_30_days": 0,
            "31_60_days": 0,
            "61_90_days": 0,
            "over_90_days": 0
        };

        invoices.forEach(invoice => {
            const dueDate = new Date(invoice.due_date);
            const daysPastDue = Math.floor((asOfDate - dueDate) / (1000 * 60 * 60 * 24));

            const balance = invoice.total_amount - (invoice.paid_amount || 0);

            if (balance <= 0) return;

            totalOutstanding += balance;

            if (daysPastDue <= 0) {
                aging.current += balance;
            } else if (daysPastDue <= 30) {
                aging["1_30_days"] += balance;
            } else if (daysPastDue <= 60) {
                aging["31_60_days"] += balance;
            } else if (daysPastDue <= 90) {
                aging["61_90_days"] += balance;
            } else {
                aging["over_90_days"] += balance;
            }
        });

        const response = {
            vendor_id: id,
            vendor_number: vendor.Vendor_number,
            vendor_name: vendor.name,
            tax_id: vendor.tax_id,
            total_outstanding: Math.round(totalOutstanding * 100) / 100,
            aging_summary: aging,
            as_of_date: asOfDate.toISOString().split('T')[0],
            total_invoices: invoices.length,
            active_invoices_count: invoices.length
        };

        res.status(200).json(response);

    } catch (error) {
        console.error("Error in getVendorAgingSummary:", error);
        res.status(500).json({ 
            msg: "Server Error", 
            error: error.message 
        });
    }
};


// const getFullAPAgingReport = async (req, res) => {
//     try {
//         const { vendor_id, period_id, as_of_date } = req.params;

//         let asOfDate = new Date();
//         if (as_of_date) {
//             asOfDate = new Date(as_of_date);
//             if (isNaN(asOfDate.getTime())) {
//                 return res.status(400).json({ msg: "Invalid as_of_date format. Use YYYY-MM-DD" });
//             }
//         }

//         const query = {
//             status: { $in: ["PENDING", "APPROVED"] }
//         };

//         if (vendor_id) {
//             if (!mongoose.Types.ObjectId.isValid(vendor_id)) {
//                 return res.status(400).json({ msg: "Invalid vendor_id" });
//             }
//             query.vendor_id = vendor_id;
            
//         }

        
//         console.log(vendor_id);

//         if (period_id) {
//             if (!mongoose.Types.ObjectId.isValid(period_id)) {
//                 return res.status(400).json({ msg: "Invalid period_id" });
//             }
//             query.period_id = period_id;
//         }

//         const invoices = await Ap_invoices.find(query).populate('vendor_id', 'Vendor_number');

//         let totalOutstanding = 0;

//         const aging = {
//             current: 0,
//             "1_30_days": 0,
//             "31_60_days": 0,
//             "61_90_days": 0,
//             "over_90_days": 0
//         };

//         const vendorsAging = {};

//         invoices.forEach(invoice => {
//             const vendorId = invoice.vendor_id._id.toString();
//             const vendorName = invoice.vendor_id.name;
//             const vendorNumber = invoice.vendor_id.Vendor_number;

//             const dueDate = new Date(invoice.due_date);
//             const daysPastDue = Math.floor((asOfDate - dueDate) / (1000 * 60 * 60 * 24));

//             const balance = invoice.total_amount - (invoice.paid_amount || 0);

//             if (balance <= 0) return;

//             totalOutstanding += balance;

//             let bucket = "over_90_days";
//             if (daysPastDue <= 0) bucket = "current";
//             else if (daysPastDue <= 30) bucket = "1_30_days";
//             else if (daysPastDue <= 60) bucket = "31_60_days";
//             else if (daysPastDue <= 90) bucket = "61_90_days";

//             aging[bucket] += balance;

//             if (!vendorsAging[vendorId]) {
//                 vendorsAging[vendorId] = {
//                     vendor_id: vendorId,
//                     vendor_number: vendorNumber,
//                     name: vendorName,
//                     total_outstanding: 0,
//                     aging: { current: 0, "1_30_days": 0, "31_60_days": 0, "61_90_days": 0, "over_90_days": 0 }
//                 };
//             }

//             vendorsAging[vendorId].total_outstanding += balance;
//             vendorsAging[vendorId].aging[bucket] += balance;
//         });

//         const response = {
//             as_of_date: asOfDate.toISOString().split('T')[0],
//             filters_applied: {
//                 vendor_id: vendor_id || null,
//                 period_id: period_id || null
//             },
//             total_outstanding: Math.round(totalOutstanding * 100) / 100,
//             aging_summary: aging,
//             total_vendors: Object.keys(vendorsAging).length,
//             vendors_aging: Object.values(vendorsAging)
//         };

//         res.status(200).json(response);

//     } catch (error) {
//         console.error("Error in getFullAPAgingReport:", error);
//         res.status(500).json({ msg: "Server Error", error: error.message });
//     }
// };

const getFullAPAgingReport = async (req, res) => {
    try {

        const { vendor_id, period_id, as_of_date } = req.params;

        let asOfDate = new Date();

        if (as_of_date) {
            asOfDate = new Date(as_of_date);

            if (isNaN(asOfDate.getTime())) {
                return res.status(400).json({
                    msg: "Invalid as_of_date format. Use YYYY-MM-DD"
                });
            }
        }

        const query = {
            status: {
                $in: ["PENDING", "APPROVED"]
            }
        };

        if (vendor_id) {

            if (!mongoose.Types.ObjectId.isValid(vendor_id)) {
                return res.status(400).json({
                    msg: "Invalid vendor_id"
                });
            }

            query.vendor_id = vendor_id;
        }

        if (period_id) {

            if (!mongoose.Types.ObjectId.isValid(period_id)) {
                return res.status(400).json({
                    msg: "Invalid period_id"
                });
            }

            query.period_id = period_id;
        }

        const invoices = await Ap_invoices.find(query)
            .populate("vendor_id", "Vendor_number name");

        // ===========================
        // Dashboard Summary Variables
        // ===========================

        let totalInvoicesAmount = 0;
        let totalPaidAmount = 0;
        let totalOutstanding = 0;

        let earliestDueDate = null;
        let latestDueDate = null;

        const uniqueVendors = new Set();

        // ===========================
        // Aging Summary
        // ===========================

        const aging = {
            current: 0,
            "1_30_days": 0,
            "31_60_days": 0,
            "61_90_days": 0,
            over_90_days: 0
        };

        const vendorsAging = {};

        // ===========================
        // Loop Through Invoices
        // ===========================

        invoices.forEach(invoice => {

            const vendorId = invoice.vendor_id._id.toString();
            const vendorName = invoice.vendor_id.name;
            const vendorNumber = invoice.vendor_id.Vendor_number;

            uniqueVendors.add(vendorId);

            const paidAmount = invoice.paid_amount || 0;
            const balance = invoice.total_amount - paidAmount;

            totalInvoicesAmount += invoice.total_amount;
            totalPaidAmount += paidAmount;

            const dueDate = new Date(invoice.due_date);

            if (!earliestDueDate || dueDate < earliestDueDate)
                earliestDueDate = dueDate;

            if (!latestDueDate || dueDate > latestDueDate)
                latestDueDate = dueDate;

            if (balance <= 0)
                return;

            totalOutstanding += balance;

            const daysPastDue = Math.floor(
                (asOfDate - dueDate) / (1000 * 60 * 60 * 24)
            );

            // let bucket = "over_90_days";

            // if (daysPastDue <= 0)
            //     bucket = "current";
            // else if (daysPastDue <= 30)
            //     bucket = "1_30_days";
            // else if (daysPastDue <= 60)
            //     bucket = "31_60_days";
            // else if (daysPastDue <= 90)
            //     bucket = "61_90_days";

            // aging[bucket] += balance;

            if (!vendorsAging[vendorId]) {

                vendorsAging[vendorId] = {

                    vendor_id: vendorId,
                    vendor_number: vendorNumber,
                    name: vendorName,

                    total_invoices: 0,
                    total_paid: 0,
                    total_outstanding: 0,

                    aging: {
                        current: 0,
                        "1_30_days": 0,
                        "31_60_days": 0,
                        "61_90_days": 0,
                        over_90_days: 0
                    }
                };
            }

            vendorsAging[vendorId].total_invoices += invoice.total_amount;
            vendorsAging[vendorId].total_paid += paidAmount;
            vendorsAging[vendorId].total_outstanding += balance;
            // vendorsAging[vendorId].aging[bucket] += balance;
        });

        // ===========================
        // Response
        // ===========================

        const response = {

            as_of_date: asOfDate.toISOString().split("T")[0],

            filters_applied: {
                vendor_id: vendor_id || null,
                period_id: period_id || null
            },

            summary: {

                total_invoices_amount:
                    Number(totalInvoicesAmount.toFixed(2)),

                total_paid:
                    Number(totalPaidAmount.toFixed(2)),

                total_outstanding:
                    Number(totalOutstanding.toFixed(2)),

                total_vendors:
                    uniqueVendors.size,

                period: {

                    from: earliestDueDate
                        ? earliestDueDate.toISOString().split("T")[0]
                        : null,

                    to: latestDueDate
                        ? latestDueDate.toISOString().split("T")[0]
                        : null
                }
            },

            // aging_summary: {
            //     current: Number(aging.current.toFixed(2)),
            //     "1_30_days": Number(aging["1_30_days"].toFixed(2)),
            //     "31_60_days": Number(aging["31_60_days"].toFixed(2)),
            //     "61_90_days": Number(aging["61_90_days"].toFixed(2)),
            //     over_90_days: Number(aging.over_90_days.toFixed(2))
            // },

            // vendors_aging: Object.values(vendorsAging)
        };

        return res.status(200).json(response);

    } catch (error) {

        console.error("Error in getFullAPAgingReport:", error);

        return res.status(500).json({
            msg: "Server Error",
            error: error.message
        });
    }
};

module.exports = {addAp_invoices, getallAp_invoices, getJAPById, getJAPByStatus, getVendorAgingSummary, updatestatus, getFullAPAgingReport};