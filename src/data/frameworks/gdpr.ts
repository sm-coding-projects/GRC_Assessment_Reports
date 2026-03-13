import type { Framework } from "@/types/framework";

export const gdpr: Framework = {
  id: "gdpr",
  name: "GDPR",
  description: "General Data Protection Regulation",
  version: "2016/679",
  domains: [
    {
      id: "lawful_basis",
      name: "Lawful Basis for Processing",
      controls: [
        { id: "LB-01", name: "Lawful Basis Identification", description: "The organisation has identified and documented the lawful basis for each processing activity (Art. 6).", domain: "Lawful Basis for Processing", framework: "gdpr" },
        { id: "LB-02", name: "Legitimate Interest Assessment", description: "Where legitimate interest is relied upon, a balancing test has been conducted and documented to demonstrate that the organisation's interests are not overridden by the data subject's rights (Art. 6(1)(f)).", domain: "Lawful Basis for Processing", framework: "gdpr" },
        { id: "LB-03", name: "Special Category Data", description: "Processing of special categories of personal data is only carried out where an explicit exception applies and has been documented (Art. 9).", domain: "Lawful Basis for Processing", framework: "gdpr" },
        { id: "LB-04", name: "Criminal Offence Data", description: "Processing of personal data relating to criminal convictions and offences is only carried out under the control of official authority or when authorised by law (Art. 10).", domain: "Lawful Basis for Processing", framework: "gdpr" },
        { id: "LB-05", name: "Purpose Limitation", description: "Personal data is collected for specified, explicit, and legitimate purposes and not further processed in a manner incompatible with those purposes (Art. 5(1)(b)).", domain: "Lawful Basis for Processing", framework: "gdpr" },
        { id: "LB-06", name: "Data Minimisation", description: "Personal data processed is adequate, relevant, and limited to what is necessary in relation to the purposes for which it is processed (Art. 5(1)(c)).", domain: "Lawful Basis for Processing", framework: "gdpr" },
      ],
    },
    {
      id: "consent",
      name: "Consent Management",
      controls: [
        { id: "CM-01", name: "Consent Validity", description: "Where consent is the lawful basis, it is freely given, specific, informed, and unambiguous, and involves a clear affirmative action (Art. 7, Recital 32).", domain: "Consent Management", framework: "gdpr" },
        { id: "CM-02", name: "Consent Records", description: "The organisation can demonstrate that the data subject has consented to the processing of their personal data, including records of when and how consent was obtained (Art. 7(1)).", domain: "Consent Management", framework: "gdpr" },
        { id: "CM-03", name: "Consent Withdrawal", description: "Data subjects can withdraw consent at any time, and the process for withdrawal is as easy as the process for giving consent (Art. 7(3)).", domain: "Consent Management", framework: "gdpr" },
        { id: "CM-04", name: "Children's Consent", description: "Where services are offered directly to a child, consent is obtained from the holder of parental responsibility, and reasonable efforts are made to verify this (Art. 8).", domain: "Consent Management", framework: "gdpr" },
        { id: "CM-05", name: "Consent Granularity", description: "Consent requests are presented separately from other terms and conditions, and separate consent is obtained for different processing purposes (Art. 7(2)).", domain: "Consent Management", framework: "gdpr" },
      ],
    },
    {
      id: "dsr",
      name: "Data Subject Rights",
      controls: [
        { id: "DSR-01", name: "Right of Access", description: "Data subjects can obtain confirmation as to whether personal data concerning them is being processed, and access to that data along with supplementary information (Art. 15).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-02", name: "Right to Rectification", description: "Data subjects can have inaccurate personal data rectified without undue delay, and incomplete data completed (Art. 16).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-03", name: "Right to Erasure", description: "Data subjects can have their personal data erased without undue delay where specified grounds apply (right to be forgotten) (Art. 17).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-04", name: "Right to Restriction", description: "Data subjects can obtain restriction of processing where specified conditions are met (Art. 18).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-05", name: "Right to Data Portability", description: "Data subjects can receive their personal data in a structured, commonly used, and machine-readable format and transmit it to another controller (Art. 20).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-06", name: "Right to Object", description: "Data subjects can object to processing based on legitimate interests or public interest, including profiling based on those provisions (Art. 21).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-07", name: "Automated Decision-Making", description: "Data subjects have the right not to be subject to decisions based solely on automated processing, including profiling, which produce legal or similarly significant effects (Art. 22).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-08", name: "Response Procedures", description: "The organisation has procedures to respond to data subject requests without undue delay and within one month of receipt (Art. 12(3)).", domain: "Data Subject Rights", framework: "gdpr" },
        { id: "DSR-09", name: "Identity Verification", description: "The organisation has procedures to verify the identity of data subjects making requests, without collecting excessive additional data (Art. 12(6)).", domain: "Data Subject Rights", framework: "gdpr" },
      ],
    },
    {
      id: "transparency",
      name: "Transparency and Information",
      controls: [
        { id: "TI-01", name: "Privacy Notice (Direct Collection)", description: "When personal data is collected from the data subject, the required information is provided at the time of collection in a concise, transparent, intelligible, and easily accessible form (Art. 13).", domain: "Transparency and Information", framework: "gdpr" },
        { id: "TI-02", name: "Privacy Notice (Indirect Collection)", description: "When personal data has not been obtained from the data subject, the required information is provided within a reasonable period and no later than one month (Art. 14).", domain: "Transparency and Information", framework: "gdpr" },
        { id: "TI-03", name: "Layered Notices", description: "Privacy information is provided using a layered approach with clear and plain language, using visualisation where appropriate (Art. 12(1)).", domain: "Transparency and Information", framework: "gdpr" },
        { id: "TI-04", name: "Purpose Communication", description: "The purposes of processing are clearly communicated to data subjects before any new processing begins (Art. 13(1)(c), Art. 14(1)(c)).", domain: "Transparency and Information", framework: "gdpr" },
      ],
    },
    {
      id: "dpia",
      name: "Data Protection Impact Assessments",
      controls: [
        { id: "DPIA-01", name: "DPIA Screening", description: "The organisation has a process for determining when a Data Protection Impact Assessment is required, including for systematic and extensive profiling, large-scale processing of special categories, and large-scale systematic monitoring (Art. 35(1), 35(3)).", domain: "Data Protection Impact Assessments", framework: "gdpr" },
        { id: "DPIA-02", name: "DPIA Process", description: "DPIAs include a systematic description of the processing operations, assessment of necessity and proportionality, assessment of risks to rights and freedoms, and measures to address risks (Art. 35(7)).", domain: "Data Protection Impact Assessments", framework: "gdpr" },
        { id: "DPIA-03", name: "DPO Consultation", description: "The Data Protection Officer's advice is sought when carrying out a Data Protection Impact Assessment (Art. 35(2)).", domain: "Data Protection Impact Assessments", framework: "gdpr" },
        { id: "DPIA-04", name: "Prior Consultation", description: "Where a DPIA indicates high risk that cannot be mitigated, the supervisory authority is consulted prior to processing (Art. 36).", domain: "Data Protection Impact Assessments", framework: "gdpr" },
        { id: "DPIA-05", name: "DPIA Review", description: "DPIAs are reviewed and updated when there is a change in the risk presented by processing operations (Art. 35(11)).", domain: "Data Protection Impact Assessments", framework: "gdpr" },
      ],
    },
    {
      id: "breach",
      name: "Breach Notification",
      controls: [
        { id: "BN-01", name: "Breach Detection", description: "The organisation has procedures in place to detect, investigate, and internally report personal data breaches (Art. 33(2)).", domain: "Breach Notification", framework: "gdpr" },
        { id: "BN-02", name: "Authority Notification", description: "Personal data breaches are notified to the supervisory authority without undue delay and, where feasible, not later than 72 hours after becoming aware of it, unless the breach is unlikely to result in a risk to rights and freedoms (Art. 33(1)).", domain: "Breach Notification", framework: "gdpr" },
        { id: "BN-03", name: "Data Subject Notification", description: "When a personal data breach is likely to result in a high risk to the rights and freedoms of natural persons, the data subject is informed without undue delay (Art. 34(1)).", domain: "Breach Notification", framework: "gdpr" },
        { id: "BN-04", name: "Breach Documentation", description: "All personal data breaches are documented, including the facts, effects, and remedial action taken, to enable the supervisory authority to verify compliance (Art. 33(5)).", domain: "Breach Notification", framework: "gdpr" },
        { id: "BN-05", name: "Breach Assessment", description: "The organisation has criteria for assessing the risk to individuals resulting from a breach, including the nature, sensitivity, and volume of data, and the severity of consequences (Art. 33(1)).", domain: "Breach Notification", framework: "gdpr" },
      ],
    },
    {
      id: "transfers",
      name: "International Transfers",
      controls: [
        { id: "IT-01", name: "Transfer Mechanism", description: "Transfers of personal data to third countries or international organisations only take place where an adequate level of protection is ensured, using appropriate safeguards (Art. 46).", domain: "International Transfers", framework: "gdpr" },
        { id: "IT-02", name: "Adequacy Decisions", description: "Transfers are made to countries or territories with an adequacy decision from the European Commission, and these decisions are monitored for changes (Art. 45).", domain: "International Transfers", framework: "gdpr" },
        { id: "IT-03", name: "Standard Contractual Clauses", description: "Where SCCs are used as the transfer mechanism, the latest version adopted by the Commission is implemented and supplementary measures are applied where necessary (Art. 46(2)(c)).", domain: "International Transfers", framework: "gdpr" },
        { id: "IT-04", name: "Transfer Impact Assessment", description: "Transfer impact assessments are conducted to evaluate whether the legal framework of the recipient country provides adequate protection for personal data (Schrems II requirements).", domain: "International Transfers", framework: "gdpr" },
        { id: "IT-05", name: "Binding Corporate Rules", description: "Where BCRs are used for intra-group transfers, they have been approved by the competent supervisory authority and include all required elements (Art. 47).", domain: "International Transfers", framework: "gdpr" },
        { id: "IT-06", name: "Derogations", description: "Transfers relying on derogations under Art. 49 are limited to specific situations and are not used on a regular basis.", domain: "International Transfers", framework: "gdpr" },
      ],
    },
    {
      id: "dpo",
      name: "Data Protection Officer",
      controls: [
        { id: "DPO-01", name: "DPO Designation", description: "A Data Protection Officer has been designated where required (public authority, core activities involving large-scale regular and systematic monitoring, or large-scale processing of special categories) (Art. 37).", domain: "Data Protection Officer", framework: "gdpr" },
        { id: "DPO-02", name: "DPO Independence", description: "The DPO operates independently, is not dismissed or penalised for performing their tasks, and reports directly to the highest management level (Art. 38).", domain: "Data Protection Officer", framework: "gdpr" },
        { id: "DPO-03", name: "DPO Resources", description: "The DPO is provided with the resources necessary to carry out their tasks and to maintain their expert knowledge (Art. 38(2)).", domain: "Data Protection Officer", framework: "gdpr" },
        { id: "DPO-04", name: "DPO Contact", description: "The contact details of the DPO have been published and communicated to the supervisory authority (Art. 37(7)).", domain: "Data Protection Officer", framework: "gdpr" },
      ],
    },
    {
      id: "accountability",
      name: "Records and Accountability",
      controls: [
        { id: "RA-01", name: "Records of Processing Activities", description: "The organisation maintains records of processing activities containing all required information including purposes, categories of data subjects, categories of personal data, recipients, transfers, retention periods, and security measures (Art. 30).", domain: "Records and Accountability", framework: "gdpr" },
        { id: "RA-02", name: "Data Protection by Design", description: "The organisation implements appropriate technical and organisational measures designed to implement data protection principles and integrate necessary safeguards into the processing (Art. 25(1)).", domain: "Records and Accountability", framework: "gdpr" },
        { id: "RA-03", name: "Data Protection by Default", description: "The organisation implements appropriate technical and organisational measures for ensuring that, by default, only personal data which is necessary for each specific purpose is processed (Art. 25(2)).", domain: "Records and Accountability", framework: "gdpr" },
        { id: "RA-04", name: "Data Processing Agreements", description: "Where a processor is used, a contract or other legal act governs the processing and sets out the subject-matter, duration, nature, and purpose of the processing, the type of personal data, and the obligations and rights of the controller (Art. 28).", domain: "Records and Accountability", framework: "gdpr" },
        { id: "RA-05", name: "Data Retention", description: "Personal data is kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data is processed (Art. 5(1)(e)).", domain: "Records and Accountability", framework: "gdpr" },
        { id: "RA-06", name: "Security of Processing", description: "The organisation implements appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including pseudonymisation, encryption, confidentiality, integrity, availability, resilience, and regular testing (Art. 32).", domain: "Records and Accountability", framework: "gdpr" },
        { id: "RA-07", name: "Compliance Demonstration", description: "The organisation can demonstrate compliance with GDPR principles and has appropriate documentation and evidence to support this (Art. 5(2)).", domain: "Records and Accountability", framework: "gdpr" },
      ],
    },
  ],
};
