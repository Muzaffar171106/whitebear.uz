import Contact from '../models/contact-model.js';

export const getAllContact = async (_, res) => {
    try {
        const contacts = await Contact.find();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Problem getting contacts" });
    }
};

export const createContact = async (req, res) => {
    try {
        const contact = new Contact({
            name: req.body.name,
            website: req.body.website,
            email: req.body.email,
            message: req.body.message,
        });
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({ message: "Problem creating contact" });
    }
};

export const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        let updatedData = req.body;

        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        res.status(200).json(updatedContact);
    } catch (error) {
        res.status(400).json({ message: "Problem updating contact" });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        res.status(200).json({ message: "Contact deleted" });
    } catch (error) {
        res.status(400).json({ message: "Problem deleting contact" });
    }
};