--Initial postgres table creation script 
\c rules 

DROP TABLE IF EXISTS mri_rules; 
DROP TABLE IF EXISTS rule_statistics; 

CREATE TABLE IF NOT EXISTS mri_rules ( 
    id SERIAL PRIMARY KEY, 
    body_part VARCHAR(32) NOT NULL, 
    text_val TEXT, 
    tokens TSVECTOR,
    priority VARCHAR(3),
    created_on TIMESTAMP
); 

CREATE TABLE IF NOT EXISTS rule_statistics ( 
    id SERIAL PRIMARY KEY, 
    body_part VARCHAR(32) NOT NULL, 
    text_val text, 
    count_val INT DEFAULT 0 NOT NULL
    -- Can add foreign key constraints such as UPDATE/DELETE 
); 

-- SELECT * FROM mri_rules; 

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('abdomen', 'Abscesses', to_tsvector('Abscesses'), '3A'),
('abdomen', 'Adrenal mass', to_tsvector('Adrenal mass'), '3B'),
('abdomen', 'Aneurysm (Brain and Angio)', to_tsvector('Aneurysm (Brain and Angio)'), '4'),
('abdomen', 'Appendix', to_tsvector('Appendix'), '2'),
('abdomen', 'Bowel ischemia (SBFT)', to_tsvector('Bowel ischemia (SBFT)'), '2'),
('abdomen', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('abdomen', 'Hepatic mass (likely hemangioma FNH)', to_tsvector('Hepatic mass (likely hemangioma FNH)'), '3B'),
('abdomen', 'Lesions', to_tsvector('Lesions'), '3A'),
('abdomen', 'Liver Cancer staging of new (FU timed or RT)', to_tsvector('Liver Cancer staging of new (FU timed or RT)'), '3A'),
('abdomen', 'Lymphoma query', to_tsvector('Lymphoma query'), '3A'),
('abdomen', 'Metastatic workup rad to decide', to_tsvector('Metastatic workup rad to decide'), '3A'),
('abdomen', 'MRCP (query ca 3A, NYD pain 4)', to_tsvector('MRCP (query ca 3A, NYD pain 4)'), '3A'),
('abdomen', 'MRCP known', to_tsvector('MRCP known'), '4'),
('abdomen', 'Pancreas Cancer (rad review)', to_tsvector('Pancreas Cancer (rad review)'), '3A'),
('abdomen', 'Portal vein Thrombosis', to_tsvector('Portal vein Thrombosis'), 'RAD'),
('abdomen', 'Renal Cancer  Follow up', to_tsvector('Renal Cancer Follow up'), '4'),
('abdomen', 'Renal Artery Stenosis', to_tsvector('Renal Artery Stenosis'), '4'),
('abdomen', 'Renal Cancer Query is semi', to_tsvector('Renal Cancer Query is semi'), '3B'),
('abdomen', 'SBFT  Chrohn’s (unless clinically Warrants sooner)', to_tsvector('SBFT  Chrohn’s (unless clinically Warrants sooner)'), '4'),
('abdomen', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('angio', 'Acute carotid or aortic dissection (CT equivocal)', to_tsvector('Acute carotid or aortic dissection (CT equivocal)'), '1'),
('angio', 'Critical / high grade ICA stenosissymptom', to_tsvector('Critical / high grade ICA stenosissymptom'), '2'),
('angio', 'Glomus TumorCarotids', to_tsvector('Glomus TumorCarotids'), '3C'),
('angio', 'MRA vascularrest pain, Claudication', to_tsvector('MRA vascularrest pain, Claudication'), '2'),
('angio', 'MRA vasculargangrene', to_tsvector('MRA vasculargangrene'), '1'),
('angio', 'Preoperative assessment of renal vascular invasion by renal cell carcinoma if ultrasound or CT is inconclusive', to_tsvector('Preoperative assessment of renal vascular invasion by renal cell carcinoma if ultrasound or CT is inconclusive'), '2'),
('angio', 'Suspected intracranial vascular lesion', to_tsvector('Suspected intracranial vascular lesion'), '2'),
('angio', 'Renal artery stenosis', to_tsvector('Renal artery stenosis'), '4'),
('angio', 'Screen Circle of Willis', to_tsvector('Screen Circle of Willis'), '4');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('aortic arch and branches', 'Aneurysm (confirmed, enlarging, Preop) F/U Routine)', to_tsvector('Aneurysm (confirmed, enlarging, Preop) F/U Routine)'), 'RAD'),
('aortic arch and branches', 'Coarctation', to_tsvector('Coarctation'), 'RAD'),
('aortic arch and branches', 'Vascular Abnormalities', to_tsvector('Vascular Abnormalities'), 'RAD');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('brain / head', 'Acoustic neuroma Known', to_tsvector('Acoustic neuroma Known'), '4'),
('brain / head', 'Acoustic neuroma Query ', to_tsvector('Acoustic neuroma Query '), '3C'),
('brain / head', 'Acute stroke (CT preferred as initial investigation)', to_tsvector('Acute stroke (CT preferred as initial investigation)'), '1'),
('brain / head', 'Aneurysm (Initial)', to_tsvector('Aneurysm (Initial)'), '3A'),
('brain / head', 'Aneurysm (F/U or screening)', to_tsvector('Aneurysm (F/U or screening)'), '4'),
('brain / head', 'Any acute hydrocephalus if MRI needed for RX planning (i.e. ventriculostomy)', to_tsvector('Any acute hydrocephalus if MRI needed for RX planning (i.e. ventriculostomy)'), '1'),
('brain / head', 'Arachnoid cyst ', to_tsvector('Arachnoid cyst '), '4'),
('brain / head', 'Arachnoiditis', to_tsvector('Arachnoiditis'), '3A'),
('brain / head', 'Arteriovenus malformation (known 3A/Screen)', to_tsvector('Arteriovenus malformation (known 3A/Screen)'), '3A'),
('brain / head', 'Arteriovenus malformation (f/u)', to_tsvector('Arteriovenus malformation (f/u)'), '4'),
('brain / head', 'Asymmetic sensorineural hearing loss', to_tsvector('Asymmetic sensorineural hearing loss'), '4'),
('brain / head', 'Ataxic gait', to_tsvector('Ataxic gait'), '4'),
('brain / head', 'Cavernous Malformations (Screen or f/u)', to_tsvector('Cavernous Malformations (Screen or f/u)'), '4'),
('brain / head', 'Characterization soft tissue mass likely benign (lipoma)', to_tsvector('Characterization soft tissue mass likely benign (lipoma)'), '3B'),
('brain / head', 'Cognitive change', to_tsvector('Cognitive change '), '4'),
('brain / head', 'Congenital brain/spine abnormality which is symptomatic', to_tsvector('Congenital brain/spine abnormality which is symptomatic'), '3C'),
('brain / head', 'Demyelination (like MS)', to_tsvector('Demyelination (like MS)'), '3C'),
('brain / head', 'Demyelination (like MS, diagnosis)', to_tsvector('Demyelination (like MS, diagnosis)'), '3A'),
('brain / head', 'Grand Mal Seizures, History of', to_tsvector('Grand Mal Seizures, History of'), '4'),
('brain / head', 'Grand Mal Seizures, New ', to_tsvector('Grand Mal Seizures, New '), '4'),
('brain / head', 'Head venogram ? new clot benign intracranial hypertention (Tech/Rad review)', to_tsvector('Head venogram ? new clot benign intracranial hypertention (Tech/Rad review)'), '2'),
('brain / head', 'Increased Prolactin level PIT)', to_tsvector('Increased Prolactin level PIT)'), '3C'),
('brain / head', 'Intracranial hemorrhageassessment of underlying lesion', to_tsvector('Intracranial hemorrhageassessment of underlying lesion'), '1'),
('brain / head', 'Ischemic optic Neuropathy', to_tsvector('Ischemic optic Neuropathy'), '3C'),
('brain / head', 'Know Chiari malformations', to_tsvector('Know Chiari malformation'), '4'),
('brain / head', 'Know Chiari malformations with surgical decompressions (surgical work up 3A)', to_tsvector('Know Chiari malformations with surgical decompressions (surgical work up 3A)'), '3A'),
('brain / head', 'MeningiomaFollow up', to_tsvector('MeningiomaFollow up'), '4'),
('brain / head', 'Meningiomainitial workup', to_tsvector('Meningiomainitial workup'), '3B'),
('brain / head', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('brain / head', 'MS Follow up known, ? Query new lesion', to_tsvector('MS Follow up known, ? Query new lesion'), '4'),
('brain / head', 'MS Rule out PML', to_tsvector('MS Rule out PML'), '3B'),
('brain / head', 'MSInitial diagnosis', to_tsvector('MSInitial diagnosis'), '3B'),
('brain / head', 'Neurodegenerative/ dementia', to_tsvector('Neurodegenerative/ dementia'), '4'),
('brain / head', 'Neurofibroma ', to_tsvector('Neurofibroma '), '3C'),
('brain / head', 'Optic Atrophy', to_tsvector('Optic Atrophy'), '3C'),
('brain / head', 'Optic Neuritis or Neuropathy', to_tsvector('Optic Neuritis or Neuropathy'), '3C'),
('brain / head', 'Orbital Lesion', to_tsvector('Orbital Lesion'), '3A'),
('brain / head', 'Pituitary adenoma suspected', to_tsvector('Pituitary adenoma suspected'), '3B'),
('brain / head', 'Post concussion syndrome', to_tsvector('Post concussion syndrome'), '4'),
('brain / head', 'Preoperative evaluation of posterior fossa neoplasm, deep supratentorial neoplam, or exclusion of additional metastatic lesions, if CT does not answer these questions.', to_tsvector('Preoperative evaluation of posterior fossa neoplasm, deep supratentorial neoplam, or exclusion of additional metastatic lesions, if CT does not answer these questions.'), '1'),
('brain / head', 'Pulsatile tinnitus or tinnitus ', to_tsvector('Pulsatile tinnitus or tinnitus '), '4'),
('brain / head', 'Retrocochlear disease', to_tsvector('Retrocochlear disease '), '4'),
('brain / head', 'Seizures (followup)', to_tsvector('Seizures (followup)'), '4'),
('brain / head', 'Seizures NEW symptoms', to_tsvector('Seizures NEW symptoms'), '3A'),
('brain / head', 'Skull base and nasopharyngeal tumoursfor further localizaton and surgical planning', to_tsvector('Skull base and nasopharyngeal tumoursfor further localizaton and surgical planning'), '3A'),
('brain / head', 'Skull base and nasopharyngeal tumoursfor further localizaton and surgical planning (if tumor invading ASAP Priority 2)', to_tsvector('Skull base and nasopharyngeal tumoursfor further localizaton and surgical planning (if tumor invading ASAP Priority 2)'), '2'),
('brain / head', 'Space occupying lesion (SOL) Known', to_tsvector('Space occupying lesion (SOL) Known'), '3A'),
('brain / head', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A'),
('Brain/ Head', 'Stealth (coordinated with OR date)', to_tsvector('Stealth (coordinated with OR date)'), 'RAD'),
('brain / head', 'Suspected encephalitis or abscess', to_tsvector('Suspected encephalitis or abscess'), '1'),
('brain / head', 'Suspected intracranial lesion (hx)( Rule out 4)', to_tsvector('Suspected intracranial lesion (could be 3A if more hx)( Rule out 4)'), '3A'),
('brain / head', 'Suspected intracranial lesion', to_tsvector('Suspected intracranial lesion'), '4'),
('brain / head', 'Suspected intracranial venous thrombosis if CTA unavailable or unable to be performed', to_tsvector('Suspected intracranial venous thrombosis if CTA unavailable or unable to be performed'), 'RAD'),
('brain / head', 'TMJ RJH only', to_tsvector('TMJ RJH only'), '4'),
('brain / head', 'TMJ (lockedthen semi urgent 3A) RJH only', to_tsvector('TMJ (lockedthen semi urgent 3A) RJH only'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('breast', 'Breast implants Usually looking for a leak', to_tsvector('Breast implants Usually looking for a leak'), '4'),
('breast', 'Breastresidual/recurrent disease post Tx', to_tsvector('Breastresidual/recurrent disease post Tx'), '3A'),
('breast', 'Characterization soft tissue mass likely benign (lipoma)', to_tsvector('Characterization soft tissue mass likely benign (lipoma)'), '3B'),
('breast', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('breast', 'Workup of new breast carcinoma', to_tsvector('Workup of new breast carcinoma'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('cardiac', 'cardiac ARVD', to_tsvector('cardiac ARVD'), '2'),
('cardiac', 'cardiac viability assessment or mass', to_tsvector('cardiac viability assessment or mass'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('chest', 'Characterization soft tissue masslikely benign (lipoma)', to_tsvector('Characterization soft tissue masslikely benign (lipoma)'), '3B'),
('chest', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('chest', 'Pancoast tumour', to_tsvector('Pancoast tumour'), '3A'),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour, CT is inconclusive', to_tsvector('Preoperative assessment of possible mediastinal or chest wall invasion by tumour, CT is inconclusive'), 'RAD'),
('chest', 'Preoperative assessment of possible mediastinal or chest wall invasion by tumour', to_tsvector('Preoperative assessment of possible mediastinal or chest wall invasion by tumour'), '2'),
('chest', 'Staging of new cancer ', to_tsvector('Staging of new cancer '), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('neck', 'Characterization soft tissue masslikely benign (lipoma)', to_tsvector('Characterization soft tissue masslikely benign (lipoma)'), '3B'),
('neck', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('neck', 'Skull base and nasopharyngeal tumours, for further localization and surgical planning', to_tsvector('Skull base and nasopharyngeal tumours, for further localization and surgical planning'), '2'),
('neck', 'Staging of new cancer (thyroid)', to_tsvector('Staging of new cancer (thyroid)'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES 
('pelvis', 'Anal Fistula', to_tsvector('Anal Fistula'), '4'), 
('pelvis', 'Cervical cancer follow up', to_tsvector('Cervical cancer follow up'), '4'), 
('pelvis', 'Cervix Cancer staging', to_tsvector('Cervix Cancer staging'), '3A'), 
('pelvis', 'Fetal abnormality', to_tsvector('Fetal abnormality'), '3A'),
('pelvis', 'Fibroids', to_tsvector('Fibroids'), '4'), 
('pelvis', 'Inguinal Hernia', to_tsvector('Inguinal Hernia'), 'RAD'),
('pelvis', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'),
('pelvis', 'Post UAE (uterine Artery Emblization)', to_tsvector('Post UAE (uterine Artery Emblization)'), 'RAD'),
('pelvis', 'Prostate CA', to_tsvector('Prostate CA'), '3B'), 
('pelvis', 'Rectal carcinoma new diagnosis or staging', to_tsvector('Rectal carcinoma new diagnosis or staging'), '2'), 
('pelvis', 'Rule out Seminoma (met)', to_tsvector('Rule out Seminoma (met)'), '3A'), 
('pelvis', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('spine', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'), 
('spine', 'Characterization soft tissue masslikely benign (lipoma)', to_tsvector('Characterization soft tissue masslikely benign (lipoma)'), '3B'), 
('spine', 'Chronic osteomyelitis', to_tsvector('Chronic osteomyelitis'), '2'), 
('spine', 'Chronic spine pain', to_tsvector('Chronic spine pain'), '4'), 
('spine', 'Evaluation of spinal cord injury in acute trauma if no bony abnormality is noted, to assess cord injury of compression', to_tsvector('Evaluation of spinal cord injury in acute trauma if no bony abnormality is noted, to assess cord injury of compression'), '1'), 
('spine', 'Foot Drop', to_tsvector('Foot Drop'), '3A'),
('spine', 'Foot Drop query Tumor', to_tsvector('Foot Drop query Tumor'), '2'), 
('spine', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('spine', 'Myelopathy', to_tsvector('Myelopathy'), '2'), 
('spine', 'Neurofibroma', to_tsvector('Neurofibroma'), '3A'),
('spine', 'Neurofibromatosis (follow up)', to_tsvector('Neurofibromatosis (follow up)'), '4'), 
('spine', 'Preoperative evaluation of spinal cord neoplasm', to_tsvector('Preoperative evaluation of spinal cord neoplasm'), '1'), 
('spine', 'Staging of new cancer', to_tsvector('Staging of new cancer'), '3A'), 
('spine', 'Sciatica /radiculopathy', to_tsvector('Sciatica /radiculopathy'), '4'), 
('spine', 'SI joints (rheumatology referral only)', to_tsvector('SI joints (rheumatology referral only)'), '4'),
('spine', 'Spinal Stenosis (ordered by ortho)', to_tsvector('Spinal Stenosis (ordered by ortho)'), '3A'),
('spine', 'Spinal Stenosis (ordered by GP)', to_tsvector('Spinal Stenosis (ordered by GP)'), '4'),
('spine', 'spine Lesion', to_tsvector('spine Lesion'), '3A'), 
('spine', 'spine Query cord impingement', to_tsvector('spine Query cord impingement'), '2'), 
('spine', 'spine root compression poss mass', to_tsvector('spine root compression poss mass'), '3A'), 
('spine', 'Suspicion of spinal osteomyelitis', to_tsvector('Suspicion of spinal osteomyelitis'), '2'), 
('spine', 'Syrinx (query)', to_tsvector('Syrinx (query)'), '3B'),
('spine', 'Syrinx (follow up)', to_tsvector('Syrinx (follow up)'), '4'), 
('spine', 'Urinary / bowel incontinence, HX that goes along with a Lumbar spine', to_tsvector('Urinary / bowel incontinence, HX that goes along with a Lumbar spine'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('knee', 'ACL Tear (ortho ordered surigical)', to_tsvector('ACL Tear (ortho ordered surigical)'), '2'), 
('knee', 'ACL Tear (GP)', to_tsvector('ACL Tear (GP)'), '4'),
('knee', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('knee', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('knee', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('knee', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('knee', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('knee', 'GP knee, acute (new injury)', to_tsvector('GP knee, acute (new injury)'), '3C'), 
('knee', 'GP knee, chronic HX or meniscal tear (not new injury)', to_tsvector('GP knee, chronic HX or meniscal tear (not new injury)'), '4'), 
('knee', 'Impingement', to_tsvector('Impingement'), '4'), 
('knee', 'Joint Injury', to_tsvector('Joint Injury'), '4'),
('knee', 'Locked knee (GP or specialist)', to_tsvector('Locked knee (GP or specialist)'), '3A'), 
('knee', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('knee', 'Orthopedic knee, acute', to_tsvector('Orthopedic knee, acute'), '3B'), 
('knee', 'Orthopedic knee, chronic', to_tsvector('Orthopedic knee, chronic'), '3C'), 
('knee', 'Orthopedic knee', to_tsvector('Orthopedic knee'), '3A'), 
('knee', 'Osteochondromas (unless concern clinically)', to_tsvector('Osteochondromas (unless concern clinically)'), '4'), 
('knee', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('knee', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('hip', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('hip', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('hip', 'Brachail plexus', to_tsvector('Brachail plexus'), '4'),
('hip', 'Brachail plexus query tumor', to_tsvector('Brachail plexus query tumor'), '4'),
('hip', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('hip', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('hip', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('hip', 'Hip Querym labral tear (arthrogram)', to_tsvector('Hip Query, labral tear (arthrogram)'), '4'),
('hip', 'Joint Injury', to_tsvector('Joint Injury'), '4'),
('hip', 'Labral tear query', to_tsvector('Labral tear query'), '4'),
('hip', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('hip', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('hip', 'R/O occult fractures from ER: Hip', to_tsvector('R/O occult fractures from ER: Hip'), '2'), 
('hip', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('shoulder', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('shoulder', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('shoulder', 'Brachail plexus', to_tsvector('Brachail plexus'), '4'),
('shoulder', 'Brachail plexus query tumor', to_tsvector('Brachail plexus query tumor'), '4'),
('shoulder', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('shoulder', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('shoulder', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('shoulder', 'Impingement', to_tsvector('Impingement'), '4'),
('shoulder', 'Joint Injury (ie. labrum)', to_tsvector('Joint Injury (ie. labrum)'), '4'),
('shoulder', 'Labral tear query', to_tsvector('Labral tear query'), '4'),
('shoulder', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('shoulder', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('shoulder', 'Rotator cuff query tear', to_tsvector('Rotator cuff query tear'), '3C'), 
('shoulder', 'SLAP tear Query (arthrogram)', to_tsvector('SLAP tear Query (arthrogram)'), '4'), 
('shoulder', 'Supraspinatus tendon', to_tsvector('Supraspinatus tendon'), '4'), 
('shoulder', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('wrist / hand', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('wrist / hand', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('wrist / hand', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('wrist / hand', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('wrist / hand', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('wrist / hand', 'Joint Injury', to_tsvector('Joint Injury'), '4'),
('wrist / hand', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('wrist / hand', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('wrist / hand', 'R/O occult fractures from ER: scaphoid', to_tsvector('R/O occult fractures from ER: scaphoid'), '2'), 
('wrist / hand', 'TFCC (Traingular fibrocartilage complex) wrist tear', to_tsvector('TFCC (Traingular fibrocartilage complex ) wrist tear'), '4'), 
('wrist / hand', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('foot', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('foot', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('foot', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('foot', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('foot', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('foot', 'Foot Query Mortens Neuroma', to_tsvector('Foot Query Mortens Neuroma'), '4'),
('foot', 'Joint Injury', to_tsvector('Joint Injury'), '4'),
('foot', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('foot', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('foot', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('c-spine', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('c-spine', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('c-spine', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('c-spine', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('c-spine', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('c-spine', 'Brachail plexus', to_tsvector('Brachail plexus'), '4'),
('c-spine', 'Brachail plexus query tumor', to_tsvector('Brachail plexus query tumor'), '4'),
('c-spine', 'Joint Injury', to_tsvector('Joint Injury'), '4'),
('c-spine', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('c-spine', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('c-spine', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('elbow', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('elbow', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('elbow', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('elbow', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('elbow', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('elbow', 'Joint Injury', to_tsvector('Joint Injury'), '4'),
('elbow', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('elbow', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('elbow', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO mri_rules(body_part, text_val, tokens, priority) VALUES
('ankle', 'Acute joint injury/tendon rupture', to_tsvector('Acute joint injury/tendon rupture'), '2'),
('ankle', 'Acute osteomyelitis', to_tsvector('Acute osteomyelitis'), '1'),
('ankle', 'Characterization soft tissue mass, likely benign (lipoma)', to_tsvector('Characterization soft tissue mass, likely benign (lipoma)'), '3B'),
('ankle', 'Chronic joint pain', to_tsvector('Chronic joint pain'), '4'),
('ankle', 'Chronic Osteomyelitis', to_tsvector('Chronic Osteomyelitis'), '2'),
('ankle', 'Joint Injury', to_tsvector('Joint Injury'), '4'),
('ankle', 'Metastatic workup', to_tsvector('Metastatic workup'), '3A'), 
('ankle', 'Primary sarcoma of bone or soft tissue', to_tsvector('Primary sarcoma of bone or soft tissue'), '2'), 
('ankle', 'Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive', to_tsvector('Strong suspicion of avascular necrosis if plain film, Nuclear Medicine or CT inconclusive'), '2');

INSERT INTO rule_statistics (id, body_part, text_val)
SELECT m.id, m.body_part, m.text_val
FROM mri_rules m;