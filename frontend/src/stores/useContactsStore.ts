import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Contact {
  id: string;
  name: string;
  address: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactsState {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Contact;
  updateContact: (id: string, updates: Partial<Omit<Contact, "id" | "createdAt">>) => void;
  deleteContact: (id: string) => void;
  getContact: (id: string) => Contact | undefined;
  getContactByAddress: (address: string) => Contact | undefined;
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],

      addContact: (contactData) => {
        const now = new Date().toISOString();
        const contact: Contact = {
          ...contactData,
          id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ contacts: [...state.contacts, contact] }));
        return contact;
      },

      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        }));
      },

      getContact: (id) => {
        return get().contacts.find((c) => c.id === id);
      },

      getContactByAddress: (address) => {
        return get().contacts.find(
          (c) => c.address.toLowerCase() === address.toLowerCase()
        );
      },
    }),
    {
      name: "pactum-contacts",
    }
  )
);
