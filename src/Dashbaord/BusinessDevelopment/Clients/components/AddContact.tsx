// Clients: simple contact card shown on client profile pages.
import React from 'react'
import {FaMailBulk, FaPhone} from "react-icons/fa";

export const AddContact = () => {
  return (
    <div>
      {/* Contact identity block */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="px-4 py-3 text-white rounded-full bg-primary">FB</div>
        <div>
          <p className="text-lg">Francoise Biya</p>
          <p className="text-textColor">Procurement Director</p>
        </div>
      </div>
      {/* Contact methods */}
      <div className='mt-3'>
        <p className="flex items-center gap-2 text-blue-800">
          <FaMailBulk /> mbongomobngo4@gmail.com
        </p>
        <p className="flex items-center gap-2 text-blue-800">
          <FaPhone className="rotate-90" /> +23768493492
        </p>
      </div>
    </div>
  );
}
