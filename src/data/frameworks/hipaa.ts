import type { Framework } from "@/types/framework";

export const hipaa: Framework = {
  id: "hipaa",
  name: "HIPAA Security Rule",
  description: "Health Insurance Portability and Accountability Act",
  version: "2013",
  domains: [
    {
      id: "administrative",
      name: "Administrative Safeguards",
      controls: [
        {
          id: "164.308(a)(1)(i)",
          name: "Security Management Process",
          description:
            "Implement policies and procedures to prevent, detect, contain, and correct security violations",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(1)(ii)(A)",
          name: "Risk Analysis",
          description:
            "Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of electronic protected health information held by the covered entity or business associate",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(1)(ii)(B)",
          name: "Risk Management",
          description:
            "Implement security measures sufficient to reduce risks and vulnerabilities to a reasonable and appropriate level to comply with §164.306(a)",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(1)(ii)(C)",
          name: "Sanction Policy",
          description:
            "Apply appropriate sanctions against workforce members who fail to comply with the security policies and procedures of the covered entity or business associate",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(1)(ii)(D)",
          name: "Information System Activity Review",
          description:
            "Implement procedures to regularly review records of information system activity, such as audit logs, access reports, and security incident tracking reports",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(2)",
          name: "Assigned Security Responsibility",
          description:
            "Identify the security official who is responsible for the development and implementation of the policies and procedures required for the entity",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(3)(i)",
          name: "Workforce Security",
          description:
            "Implement policies and procedures to ensure that all members of its workforce have appropriate access to electronic protected health information and to prevent those workforce members who do not have access from obtaining access",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(3)(ii)(A)",
          name: "Authorisation and/or Supervision",
          description:
            "Implement procedures for the authorisation and/or supervision of workforce members who work with electronic protected health information or in locations where it might be accessed",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(3)(ii)(B)",
          name: "Workforce Clearance Procedure",
          description:
            "Implement procedures to determine that the access of a workforce member to electronic protected health information is appropriate",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(3)(ii)(C)",
          name: "Termination Procedures",
          description:
            "Implement procedures for terminating access to electronic protected health information when the employment of, or other arrangement with, a workforce member ends",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(4)(i)",
          name: "Information Access Management",
          description:
            "Implement policies and procedures for authorising access to electronic protected health information that are consistent with the applicable requirements of the Privacy Rule",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(4)(ii)(A)",
          name: "Isolating Healthcare Clearinghouse Functions",
          description:
            "If a healthcare clearinghouse is part of a larger organisation, the clearinghouse must implement policies and procedures that protect the electronic protected health information of the clearinghouse from unauthorised access by the larger organisation",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(4)(ii)(B)",
          name: "Access Authorisation",
          description:
            "Implement policies and procedures for granting access to electronic protected health information, for example, through access to a workstation, transaction, program, process, or other mechanism",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(4)(ii)(C)",
          name: "Access Establishment and Modification",
          description:
            "Implement policies and procedures that, based upon the covered entity's or the business associate's access authorisation policies, establish, document, review, and modify a user's right of access to a workstation, transaction, program, or process",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(5)(i)",
          name: "Security Awareness and Training",
          description:
            "Implement a security awareness and training programme for all members of its workforce including management",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(5)(ii)(A)",
          name: "Security Reminders",
          description: "Implement periodic security updates",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(5)(ii)(B)",
          name: "Protection from Malicious Software",
          description:
            "Implement procedures for guarding against, detecting, and reporting malicious software",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(5)(ii)(C)",
          name: "Log-in Monitoring",
          description:
            "Implement procedures for monitoring log-in attempts and reporting discrepancies",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(5)(ii)(D)",
          name: "Password Management",
          description:
            "Implement procedures for creating, changing, and safeguarding passwords",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(6)(i)",
          name: "Security Incident Procedures",
          description:
            "Implement policies and procedures to address security incidents",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(6)(ii)",
          name: "Response and Reporting",
          description:
            "Identify and respond to suspected or known security incidents; mitigate, to the extent practicable, harmful effects of security incidents that are known to the covered entity or business associate; and document security incidents and their outcomes",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(7)(i)",
          name: "Contingency Plan",
          description:
            "Establish and implement as needed policies and procedures for responding to an emergency or other occurrence that damages systems that contain electronic protected health information",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(7)(ii)(A)",
          name: "Data Backup Plan",
          description:
            "Establish and implement procedures to create and maintain retrievable exact copies of electronic protected health information",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(7)(ii)(B)",
          name: "Disaster Recovery Plan",
          description:
            "Establish and implement as needed procedures to restore any loss of data",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(7)(ii)(C)",
          name: "Emergency Mode Operation Plan",
          description:
            "Establish and implement as needed procedures to enable continuation of critical business processes for protection of the security of electronic protected health information while operating in emergency mode",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(7)(ii)(D)",
          name: "Testing and Revision Procedures",
          description:
            "Implement procedures for periodic testing and revision of contingency plans",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(7)(ii)(E)",
          name: "Applications and Data Criticality Analysis",
          description:
            "Assess the relative criticality of specific applications and data in support of other contingency plan components",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(a)(8)",
          name: "Evaluation",
          description:
            "Perform a periodic technical and nontechnical evaluation, based initially upon the standards implemented under this rule and, subsequently, in response to environmental or operational changes affecting the security of electronic protected health information",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(b)(1)",
          name: "Business Associate Contracts and Other Arrangements",
          description:
            "A covered entity may permit a business associate to create, receive, maintain, or transmit electronic protected health information on the covered entity's behalf only if the covered entity obtains satisfactory assurances that the business associate will appropriately safeguard the information",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.308(b)(4)",
          name: "Written Contract or Other Arrangement",
          description:
            "Document the satisfactory assurances required by establishing a written contract or other arrangement with the business associate that meets the applicable requirements",
          domain: "Administrative Safeguards",
          framework: "hipaa",
        },
      ],
    },
    {
      id: "physical",
      name: "Physical Safeguards",
      controls: [
        {
          id: "164.310(a)(1)",
          name: "Facility Access Controls",
          description:
            "Implement policies and procedures to limit physical access to its electronic information systems and the facility or facilities in which they are housed, while ensuring that properly authorised access is allowed",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(a)(2)(i)",
          name: "Contingency Operations",
          description:
            "Establish and implement as needed procedures that allow facility access in support of restoration of lost data under the disaster recovery plan and emergency mode operations plan in the event of an emergency",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(a)(2)(ii)",
          name: "Facility Security Plan",
          description:
            "Implement policies and procedures to safeguard the facility and the equipment therein from unauthorised physical access, tampering, and theft",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(a)(2)(iii)",
          name: "Access Control and Validation Procedures",
          description:
            "Implement procedures to control and validate a person's access to facilities based on their role or function, including visitor control, and control of access to software programs for testing and revision",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(a)(2)(iv)",
          name: "Maintenance Records",
          description:
            "Implement policies and procedures to document repairs and modifications to the physical components of a facility which are related to security",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(b)",
          name: "Workstation Use",
          description:
            "Implement policies and procedures that specify the proper functions to be performed, the manner in which those functions are to be performed, and the physical attributes of the surroundings of a specific workstation or class of workstation that can access electronic protected health information",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(c)",
          name: "Workstation Security",
          description:
            "Implement physical safeguards for all workstations that access electronic protected health information, to restrict access to authorised users",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(d)(1)",
          name: "Device and Media Controls",
          description:
            "Implement policies and procedures that govern the receipt and removal of hardware and electronic media that contain electronic protected health information into and out of a facility, and the movement of these items within the facility",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(d)(2)(i)",
          name: "Disposal",
          description:
            "Implement policies and procedures to address the final disposition of electronic protected health information and/or the hardware or electronic media on which it is stored",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(d)(2)(ii)",
          name: "Media Re-use",
          description:
            "Implement procedures for removal of electronic protected health information from electronic media before the media are made available for re-use",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(d)(2)(iii)",
          name: "Accountability",
          description:
            "Maintain a record of the movements of hardware and electronic media and any person responsible therefore",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.310(d)(2)(iv)",
          name: "Data Backup and Storage",
          description:
            "Create a retrievable, exact copy of electronic protected health information, when needed, before movement of equipment",
          domain: "Physical Safeguards",
          framework: "hipaa",
        },
      ],
    },
    {
      id: "technical",
      name: "Technical Safeguards",
      controls: [
        {
          id: "164.312(a)(1)",
          name: "Access Control",
          description:
            "Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights as specified in §164.308(a)(4)",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(a)(2)(i)",
          name: "Unique User Identification",
          description:
            "Assign a unique name and/or number for identifying and tracking user identity",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(a)(2)(ii)",
          name: "Emergency Access Procedure",
          description:
            "Establish and implement as needed procedures for obtaining necessary electronic protected health information during an emergency",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(a)(2)(iii)",
          name: "Automatic Logoff",
          description:
            "Implement electronic procedures that terminate an electronic session after a predetermined time of inactivity",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(a)(2)(iv)",
          name: "Encryption and Decryption",
          description:
            "Implement a mechanism to encrypt and decrypt electronic protected health information",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(b)",
          name: "Audit Controls",
          description:
            "Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(c)(1)",
          name: "Integrity",
          description:
            "Implement policies and procedures to protect electronic protected health information from improper alteration or destruction",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(c)(2)",
          name: "Mechanism to Authenticate Electronic Protected Health Information",
          description:
            "Implement electronic mechanisms to corroborate that electronic protected health information has not been altered or destroyed in an unauthorised manner",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(d)",
          name: "Person or Entity Authentication",
          description:
            "Implement procedures to verify that a person or entity seeking access to electronic protected health information is the one claimed",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(e)(1)",
          name: "Transmission Security",
          description:
            "Implement technical security measures to guard against unauthorised access to electronic protected health information that is being transmitted over an electronic communications network",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(e)(2)(i)",
          name: "Integrity Controls",
          description:
            "Implement security measures to ensure that electronically transmitted electronic protected health information is not improperly modified without detection until disposed of",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
        {
          id: "164.312(e)(2)(ii)",
          name: "Encryption",
          description:
            "Implement a mechanism to encrypt electronic protected health information whenever deemed appropriate",
          domain: "Technical Safeguards",
          framework: "hipaa",
        },
      ],
    },
  ],
};
