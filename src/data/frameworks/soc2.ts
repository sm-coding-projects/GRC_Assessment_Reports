import type { Framework } from "@/types/framework";

export const soc2: Framework = {
  id: "soc2",
  name: "SOC 2",
  description: "System and Organization Controls 2",
  version: "2017",
  domains: [
    {
      id: "CC1",
      name: "CC1 — Control Environment",
      controls: [
        {
          id: "CC1.1",
          name: "COSO Principle 1 — The entity demonstrates a commitment to integrity and ethical values",
          description:
            "The entity demonstrates a commitment to integrity and ethical values.",
          domain: "CC1 — Control Environment",
          framework: "soc2",
        },
        {
          id: "CC1.2",
          name: "COSO Principle 2 — The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control",
          description:
            "The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal control.",
          domain: "CC1 — Control Environment",
          framework: "soc2",
        },
        {
          id: "CC1.3",
          name: "COSO Principle 3 — Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities in the pursuit of objectives",
          description:
            "Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities in the pursuit of objectives.",
          domain: "CC1 — Control Environment",
          framework: "soc2",
        },
        {
          id: "CC1.4",
          name: "COSO Principle 4 — The entity demonstrates a commitment to attract, develop, and retain competent individuals in alignment with objectives",
          description:
            "The entity demonstrates a commitment to attract, develop, and retain competent individuals in alignment with objectives.",
          domain: "CC1 — Control Environment",
          framework: "soc2",
        },
        {
          id: "CC1.5",
          name: "COSO Principle 5 — The entity holds individuals accountable for their internal control responsibilities in the pursuit of objectives",
          description:
            "The entity holds individuals accountable for their internal control responsibilities in the pursuit of objectives.",
          domain: "CC1 — Control Environment",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC2",
      name: "CC2 — Communication and Information",
      controls: [
        {
          id: "CC2.1",
          name: "COSO Principle 13 — The entity obtains or generates and uses relevant, quality information to support the functioning of internal control",
          description:
            "The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.",
          domain: "CC2 — Communication and Information",
          framework: "soc2",
        },
        {
          id: "CC2.2",
          name: "COSO Principle 14 — The entity internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal control",
          description:
            "The entity internally communicates information, including objectives and responsibilities for internal control, necessary to support the functioning of internal control.",
          domain: "CC2 — Communication and Information",
          framework: "soc2",
        },
        {
          id: "CC2.3",
          name: "COSO Principle 15 — The entity communicates with external parties regarding matters affecting the functioning of internal control",
          description:
            "The entity communicates with external parties regarding matters affecting the functioning of internal control.",
          domain: "CC2 — Communication and Information",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC3",
      name: "CC3 — Risk Assessment",
      controls: [
        {
          id: "CC3.1",
          name: "COSO Principle 6 — The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives",
          description:
            "The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives.",
          domain: "CC3 — Risk Assessment",
          framework: "soc2",
        },
        {
          id: "CC3.2",
          name: "COSO Principle 7 — The entity identifies risks to the achievement of its objectives across the entity and analyses risks as a basis for determining how the risks should be managed",
          description:
            "The entity identifies risks to the achievement of its objectives across the entity and analyses risks as a basis for determining how the risks should be managed.",
          domain: "CC3 — Risk Assessment",
          framework: "soc2",
        },
        {
          id: "CC3.3",
          name: "COSO Principle 8 — The entity considers the potential for fraud in assessing risks to the achievement of objectives",
          description:
            "The entity considers the potential for fraud in assessing risks to the achievement of objectives.",
          domain: "CC3 — Risk Assessment",
          framework: "soc2",
        },
        {
          id: "CC3.4",
          name: "COSO Principle 9 — The entity identifies and assesses changes that could significantly impact the system of internal control",
          description:
            "The entity identifies and assesses changes that could significantly impact the system of internal control.",
          domain: "CC3 — Risk Assessment",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC4",
      name: "CC4 — Monitoring Activities",
      controls: [
        {
          id: "CC4.1",
          name: "COSO Principle 16 — The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning",
          description:
            "The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.",
          domain: "CC4 — Monitoring Activities",
          framework: "soc2",
        },
        {
          id: "CC4.2",
          name: "COSO Principle 17 — The entity evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action, including senior management and the board of directors, as appropriate",
          description:
            "The entity evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action, including senior management and the board of directors, as appropriate.",
          domain: "CC4 — Monitoring Activities",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC5",
      name: "CC5 — Control Activities",
      controls: [
        {
          id: "CC5.1",
          name: "COSO Principle 10 — The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels",
          description:
            "The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.",
          domain: "CC5 — Control Activities",
          framework: "soc2",
        },
        {
          id: "CC5.2",
          name: "COSO Principle 11 — The entity also selects and develops general control activities over technology to support the achievement of objectives",
          description:
            "The entity also selects and develops general control activities over technology to support the achievement of objectives.",
          domain: "CC5 — Control Activities",
          framework: "soc2",
        },
        {
          id: "CC5.3",
          name: "COSO Principle 12 — The entity deploys control activities through policies that establish what is expected and in procedures that put policies into action",
          description:
            "The entity deploys control activities through policies that establish what is expected and in procedures that put policies into action.",
          domain: "CC5 — Control Activities",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC6",
      name: "CC6 — Logical and Physical Access Controls",
      controls: [
        {
          id: "CC6.1",
          name: "Logical Access Security Software, Infrastructure, and Architectures",
          description:
            "The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity's objectives.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
        {
          id: "CC6.2",
          name: "User Registration and Deregistration",
          description:
            "Prior to issuing system credentials and granting system access, the entity registers and authorises new internal and external users whose access is administered by the entity. For those users whose access is administered by the entity, user system credentials are removed when user access is no longer authorised.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
        {
          id: "CC6.3",
          name: "Role-Based Access and Least Privilege",
          description:
            "The entity authorises, modifies, or removes access to data, software, functions, and other protected information assets based on roles, responsibilities, or the system design and changes, giving consideration to the concepts of least privilege and segregation of duties, to meet the entity's objectives.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
        {
          id: "CC6.4",
          name: "Physical Access Restrictions",
          description:
            "The entity restricts physical access to facilities and protected information assets to authorised personnel to meet the entity's objectives.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
        {
          id: "CC6.5",
          name: "Discontinuation of Logical and Physical Protections",
          description:
            "The entity discontinues logical and physical protections over physical assets only after the ability to read or recover data and software from those assets has been diminished and is no longer required to meet the entity's objectives.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
        {
          id: "CC6.6",
          name: "Logical Access Security Against External Threats",
          description:
            "The entity implements logical access security measures to protect against threats from sources outside its system boundaries.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
        {
          id: "CC6.7",
          name: "Restriction of Information Transmission and Movement",
          description:
            "The entity restricts the transmission, movement, and removal of information to authorised internal and external users and processes, and protects it during transmission, movement, or removal to meet the entity's objectives.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
        {
          id: "CC6.8",
          name: "Prevention and Detection of Unauthorised Software",
          description:
            "The entity implements controls to prevent or detect and act upon the introduction of unauthorised or malicious software to meet the entity's objectives.",
          domain: "CC6 — Logical and Physical Access Controls",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC7",
      name: "CC7 — System Operations",
      controls: [
        {
          id: "CC7.1",
          name: "Detection and Monitoring of Vulnerabilities",
          description:
            "To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities, and susceptibilities to newly discovered vulnerabilities.",
          domain: "CC7 — System Operations",
          framework: "soc2",
        },
        {
          id: "CC7.2",
          name: "Anomaly Monitoring and Security Event Identification",
          description:
            "The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity's ability to meet its objectives; anomalies are analysed to determine whether they represent security events.",
          domain: "CC7 — System Operations",
          framework: "soc2",
        },
        {
          id: "CC7.3",
          name: "Security Event Evaluation",
          description:
            "The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives (security incidents) and, if so, takes actions to prevent or address such failures.",
          domain: "CC7 — System Operations",
          framework: "soc2",
        },
        {
          id: "CC7.4",
          name: "Incident Response",
          description:
            "The entity responds to identified security incidents by executing a defined incident response programme to understand, contain, remediate, and communicate security incidents, as appropriate.",
          domain: "CC7 — System Operations",
          framework: "soc2",
        },
        {
          id: "CC7.5",
          name: "Incident Recovery",
          description:
            "The entity identifies, develops, and implements activities to recover from identified security incidents.",
          domain: "CC7 — System Operations",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC8",
      name: "CC8 — Change Management",
      controls: [
        {
          id: "CC8.1",
          name: "Change Authorisation and Implementation",
          description:
            "The entity authorises, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet its objectives.",
          domain: "CC8 — Change Management",
          framework: "soc2",
        },
      ],
    },
    {
      id: "CC9",
      name: "CC9 — Risk Mitigation",
      controls: [
        {
          id: "CC9.1",
          name: "Business Disruption Risk Mitigation",
          description:
            "The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.",
          domain: "CC9 — Risk Mitigation",
          framework: "soc2",
        },
        {
          id: "CC9.2",
          name: "Vendor and Business Partner Risk Management",
          description:
            "The entity assesses and manages risks associated with vendors and business partners.",
          domain: "CC9 — Risk Mitigation",
          framework: "soc2",
        },
      ],
    },
    {
      id: "A1",
      name: "A1 — Availability",
      controls: [
        {
          id: "A1.1",
          name: "Capacity Management",
          description:
            "The entity maintains, monitors, and evaluates current processing capacity and use of system components (infrastructure, data, and software) to manage capacity demand and to enable the implementation of additional capacity to help meet its objectives.",
          domain: "A1 — Availability",
          framework: "soc2",
        },
        {
          id: "A1.2",
          name: "Environmental Protections and Data Recovery",
          description:
            "The entity authorises, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup processes, and recovery infrastructure to meet its objectives.",
          domain: "A1 — Availability",
          framework: "soc2",
        },
        {
          id: "A1.3",
          name: "Recovery Plan Testing",
          description:
            "The entity tests recovery plan procedures supporting system recovery to meet its objectives.",
          domain: "A1 — Availability",
          framework: "soc2",
        },
      ],
    },
    {
      id: "PI1",
      name: "PI1 — Processing Integrity",
      controls: [
        {
          id: "PI1.1",
          name: "Processing Objectives and Quality Information",
          description:
            "The entity obtains or generates, uses, and communicates relevant, quality information regarding the objectives related to processing, including definitions of data processed and product and service specifications, to support the use of products and services.",
          domain: "PI1 — Processing Integrity",
          framework: "soc2",
        },
        {
          id: "PI1.2",
          name: "System Input Controls",
          description:
            "The entity implements policies and procedures over system inputs, including controls over completeness and accuracy, to result in products, services, and reporting to meet the entity's objectives.",
          domain: "PI1 — Processing Integrity",
          framework: "soc2",
        },
        {
          id: "PI1.3",
          name: "System Processing Controls",
          description:
            "The entity implements policies and procedures over system processing to result in products, services, and reporting to meet the entity's objectives.",
          domain: "PI1 — Processing Integrity",
          framework: "soc2",
        },
        {
          id: "PI1.4",
          name: "System Output Controls",
          description:
            "The entity implements policies and procedures to make available or deliver output completely, accurately, and timely in accordance with specifications to meet the entity's objectives.",
          domain: "PI1 — Processing Integrity",
          framework: "soc2",
        },
        {
          id: "PI1.5",
          name: "System Storage Controls",
          description:
            "The entity implements policies and procedures to store inputs, items in processing, and outputs completely, accurately, and timely in accordance with system specifications to meet the entity's objectives.",
          domain: "PI1 — Processing Integrity",
          framework: "soc2",
        },
      ],
    },
    {
      id: "C1",
      name: "C1 — Confidentiality",
      controls: [
        {
          id: "C1.1",
          name: "Identification and Maintenance of Confidential Information",
          description:
            "The entity identifies and maintains confidential information to meet the entity's objectives related to confidentiality.",
          domain: "C1 — Confidentiality",
          framework: "soc2",
        },
        {
          id: "C1.2",
          name: "Disposal of Confidential Information",
          description:
            "The entity disposes of confidential information to meet the entity's objectives related to confidentiality.",
          domain: "C1 — Confidentiality",
          framework: "soc2",
        },
      ],
    },
    {
      id: "P1",
      name: "P1 — Privacy",
      controls: [
        {
          id: "P1.1",
          name: "Privacy Notice",
          description:
            "The entity provides notice to data subjects about its privacy practices to meet the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
        {
          id: "P1.2",
          name: "Choice and Consent",
          description:
            "The entity communicates choices available regarding the collection, use, retention, disclosure, and disposal of personal information to the data subjects and the consequences, if any, of each choice, to meet the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
        {
          id: "P1.3",
          name: "Personal Information Collection",
          description:
            "Personal information is collected consistent with the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
        {
          id: "P1.4",
          name: "Use of Personal Information",
          description:
            "The entity limits the use of personal information to the purposes identified in the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
        {
          id: "P1.5",
          name: "Retention of Personal Information",
          description:
            "The entity retains personal information consistent with the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
        {
          id: "P1.6",
          name: "Disposal of Personal Information",
          description:
            "The entity securely disposes of personal information to meet the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
        {
          id: "P1.7",
          name: "Disclosure to Third Parties",
          description:
            "The entity discloses personal information to third parties with the consent of the data subjects to meet the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
        {
          id: "P1.8",
          name: "Data Subject Access",
          description:
            "The entity provides data subjects with access to their personal information for review and correction (including transfer to a third party, if applicable) and informs data subjects if access is denied to meet the entity's objectives related to privacy.",
          domain: "P1 — Privacy",
          framework: "soc2",
        },
      ],
    },
  ],
};
