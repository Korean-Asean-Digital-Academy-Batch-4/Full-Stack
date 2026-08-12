--
-- PostgreSQL database dump
--

\restrict bPmp4aylA75sVk11rVAVEXP2BQvEsLuRqEoWThdXswJB8zJRgmRmSBPYmHxSiYG

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_years (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    is_active boolean DEFAULT false NOT NULL
);


--
-- Name: administrators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administrators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    password_hash character varying(64) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: assessment_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_components (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    weight_percent numeric(5,2) NOT NULL,
    sort_order integer NOT NULL,
    CONSTRAINT assessment_components_weight_check CHECK (((weight_percent >= (0)::numeric) AND (weight_percent <= (100)::numeric)))
);


--
-- Name: assessment_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    component_id uuid NOT NULL,
    topic text NOT NULL,
    updated_by_teacher_id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_topics_topic_check CHECK (((char_length(btrim(topic)) >= 1) AND (char_length(btrim(topic)) <= 100)))
);


--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    status character varying(50) DEFAULT 'Alpa'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT attendance_records_status_check CHECK (((status)::text = ANY ((ARRAY['Hadir'::character varying, 'Izin'::character varying, 'Sakit'::character varying, 'Alpa'::character varying])::text[])))
);


--
-- Name: attendance_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    session_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: class_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    student_id uuid NOT NULL
);


--
-- Name: class_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.class_subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    grade_level character varying(50) NOT NULL,
    semester_id uuid NOT NULL,
    homeroom_teacher_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT classes_grade_level_check CHECK (((grade_level)::text = ANY ((ARRAY['X'::character varying, 'XI'::character varying, 'XII'::character varying])::text[])))
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    component_id uuid NOT NULL,
    score numeric(5,2),
    filled_by_teacher_id uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT grades_score_check CHECK (((score IS NULL) OR ((score >= (0)::numeric) AND (score <= (100)::numeric))))
);


--
-- Name: report_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id uuid NOT NULL,
    student_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    status character varying(50) DEFAULT 'Draft'::character varying NOT NULL,
    general_note character varying(50),
    finalized_by uuid,
    finalized_at timestamp with time zone,
    distributed_by uuid,
    distributed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT report_cards_status_check CHECK (((status)::text = ANY ((ARRAY['Draft'::character varying, 'Finalized'::character varying, 'Distributed'::character varying])::text[])))
);


--
-- Name: semesters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.semesters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    academic_year_id uuid NOT NULL,
    name character varying(50) NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    CONSTRAINT semesters_name_check CHECK (((name)::text = ANY ((ARRAY['Ganjil'::character varying, 'Genap'::character varying])::text[])))
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nis text NOT NULL,
    name character varying(50) NOT NULL,
    password_hash character varying(64) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    nis_legacy_bigint bigint
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    grade_level character varying(50) NOT NULL,
    kkm numeric(5,2) DEFAULT 75 NOT NULL,
    teacher_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subjects_grade_level_check CHECK (((grade_level)::text = ANY ((ARRAY['X'::character varying, 'XI'::character varying, 'XII'::character varying])::text[]))),
    CONSTRAINT subjects_kkm_check CHECK (((kkm >= (0)::numeric) AND (kkm <= (100)::numeric)))
);


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nip text NOT NULL,
    name character varying(50) NOT NULL,
    password_hash character varying(64) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    nip_legacy_real real
);


--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.academic_years (id, name, is_active) FROM stdin;
cacf4447-ea25-4586-97b3-735873c9693d	2026/2027	f
a31227e5-ff7a-4009-8e06-3d470c448e9c	Ganjil	f
6e58eab5-f16c-4b0b-82f9-0a17aeee917d	2025/2026	t
\.


--
-- Data for Name: administrators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.administrators (id, name, email, password_hash, created_at) FROM stdin;
17346db1-2670-40da-98c4-43168355d13a	kadaelice	admin@sekolah.id	$2a$10$KyzG4NsFRMKdLMYon61MEuFZWmXVpHBNPbplcMJbn8I0KFVD.Wvmi	2026-08-06 05:35:37.728+00
3944984a-990f-42b5-ab61-e74724cb9460	sudo	admin@edutrack.test	$2a$10$fHz28prf0aOvi2RGtikQuuQBIxa1bnDEMysFy5RZ5khLeVhy9SelW	2026-08-10 06:39:25.129+00
\.


--
-- Data for Name: assessment_components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessment_components (id, code, weight_percent, sort_order) FROM stdin;
e0d1bff4-8dc0-4af8-956c-a7beef990958	T1	6.00	1
2d5c936b-00b0-4cd1-a7a3-b9e37220641f	T2	6.00	2
a27706b9-a21b-40f4-910e-8574f2067552	T3	6.00	3
a8751076-3a68-4d11-babf-db54b80241ac	U1	10.00	4
5bb22c48-2e12-462a-87eb-8efa81226132	U2	10.00	5
bcdada22-51c0-43c7-a90a-70a2234413d6	U3	10.00	6
6ba6d7b7-1afe-45c2-8aa1-4376dabf020b	UTS	26.00	7
49ae3a0f-8375-442e-bf7d-27b618ce4bdb	UAS	26.00	8
\.


--
-- Data for Name: assessment_topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assessment_topics (id, class_id, subject_id, component_id, topic, updated_by_teacher_id, updated_at) FROM stdin;
dd31c856-781f-4074-8aa7-2a853f771946	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	e0d1bff4-8dc0-4af8-956c-a7beef990958	ipa	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
f796b053-14a7-461f-a9e2-5d5556ffcd3e	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	2d5c936b-00b0-4cd1-a7a3-b9e37220641f	ips	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
c8df8588-a0c1-485c-a6ca-a061a9c63b33	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a27706b9-a21b-40f4-910e-8574f2067552	trigonometri	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
66e215b8-07b5-4584-ade1-b6a3d6180271	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a8751076-3a68-4d11-babf-db54b80241ac	kopdes	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
54177f1d-fe30-47c6-adad-9c5fddd39f0f	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	5bb22c48-2e12-462a-87eb-8efa81226132	jasmani	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
a1b71003-c924-49fa-87e9-4cc55ceee0ae	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	bcdada22-51c0-43c7-a90a-70a2234413d6	hehehe	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
af562e4d-9132-4690-a010-4f20cf89a599	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	6ba6d7b7-1afe-45c2-8aa1-4376dabf020b	matematika	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
1d42a706-609f-4d8c-9ace-3810117fb489	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	49ae3a0f-8375-442e-bf7d-27b618ce4bdb	coding	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:57:08.969531+00
\.


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_records (id, session_id, student_id, status, updated_at) FROM stdin;
378b80fe-bd3a-4a14-8a86-16598b12da68	2a4fca90-9870-40c3-b817-acdbb076ff28	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	Hadir	2026-08-10 08:59:58.734+00
abd6723f-ff10-4583-89aa-e099565d92fd	2a4fca90-9870-40c3-b817-acdbb076ff28	a5ff6341-3948-442d-a34f-9d9a1a11c519	Hadir	2026-08-10 08:59:58.734+00
36c4106c-a62b-4943-a317-a8738ba8adcb	2a4fca90-9870-40c3-b817-acdbb076ff28	4c786784-da22-41c6-8c9d-1ec523993c1b	Hadir	2026-08-10 08:59:58.734+00
233a0284-a1e6-4d23-a289-f99653d40a0e	2a4fca90-9870-40c3-b817-acdbb076ff28	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	Hadir	2026-08-10 08:59:58.734+00
532d49d8-b553-4d2e-82a1-ab1062e54a65	85cffb75-788f-4517-8eac-879e11532f9e	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	Hadir	2026-08-10 09:16:09.799+00
3cc57f0c-2679-46cf-b738-b11f1a6de2c6	85cffb75-788f-4517-8eac-879e11532f9e	a5ff6341-3948-442d-a34f-9d9a1a11c519	Hadir	2026-08-10 09:16:09.799+00
f100652b-7517-4c3a-baf7-c0af8290acc6	85cffb75-788f-4517-8eac-879e11532f9e	4c786784-da22-41c6-8c9d-1ec523993c1b	Hadir	2026-08-10 09:16:09.799+00
7126eb68-8d70-4fd8-8555-aeb23c229754	85cffb75-788f-4517-8eac-879e11532f9e	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	Hadir	2026-08-10 09:16:09.799+00
3b79da0f-ccbb-4ebd-abb4-85afac152681	1e5936dd-1011-48ff-8e15-59970c3d5a7b	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	Hadir	2026-08-11 09:26:51.356158+00
71823b60-3ca2-43b8-86f3-e360eae99bd7	1e5936dd-1011-48ff-8e15-59970c3d5a7b	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	Hadir	2026-08-11 09:26:51.463601+00
8362c719-a2c4-4ace-af65-8ac1ba39c220	1e5936dd-1011-48ff-8e15-59970c3d5a7b	4c786784-da22-41c6-8c9d-1ec523993c1b	Hadir	2026-08-11 09:26:51.553008+00
e441c26b-f62d-4024-b069-389be4fd4eb8	1e5936dd-1011-48ff-8e15-59970c3d5a7b	a5ff6341-3948-442d-a34f-9d9a1a11c519	Hadir	2026-08-11 09:26:51.643601+00
\.


--
-- Data for Name: attendance_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_sessions (id, class_id, subject_id, teacher_id, session_date, created_at) FROM stdin;
2a4fca90-9870-40c3-b817-acdbb076ff28	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-10	2026-08-10 08:58:28.936+00
85cffb75-788f-4517-8eac-879e11532f9e	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10	2026-08-10 09:14:28.673+00
1e5936dd-1011-48ff-8e15-59970c3d5a7b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11	2026-08-11 09:26:50.314892+00
\.


--
-- Data for Name: class_students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.class_students (id, class_id, student_id) FROM stdin;
24a9bc8e-5e96-43c4-af08-c2ab35576a03	3f3b741f-99c3-4d63-8f45-244f94deed2f	03e9a3c3-ff61-4d9f-8701-a8e7764abb13
2899638d-abf5-4079-af4f-6ce70994c7f4	3f3b741f-99c3-4d63-8f45-244f94deed2f	a5ff6341-3948-442d-a34f-9d9a1a11c519
58fc37d8-b136-4d21-9ea9-3b35d4990ea9	3f3b741f-99c3-4d63-8f45-244f94deed2f	4c786784-da22-41c6-8c9d-1ec523993c1b
5a709fc7-0543-48df-8599-aa5be4e17b7a	3f3b741f-99c3-4d63-8f45-244f94deed2f	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a
\.


--
-- Data for Name: class_subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.class_subjects (id, class_id, subject_id) FROM stdin;
3fd47339-2839-401c-b4bd-2986527f12be	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e
34b769a6-e153-4236-8ddc-45d102161cf7	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.classes (id, name, grade_level, semester_id, homeroom_teacher_id, created_at) FROM stdin;
3f3b741f-99c3-4d63-8f45-244f94deed2f	X-2	X	a7956b50-2150-4fc4-af68-63cc603523a7	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-10 07:36:07.217+00
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, student_id, class_id, subject_id, component_id, score, filled_by_teacher_id, updated_at) FROM stdin;
b38ce644-7257-434f-b484-ba8f358f09fb	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	e0d1bff4-8dc0-4af8-956c-a7beef990958	85.00	\N	2026-08-10 07:44:17.241+00
e8ed48e8-a50e-4f24-8c5c-60cb48171e0b	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	2d5c936b-00b0-4cd1-a7a3-b9e37220641f	90.00	\N	2026-08-10 07:44:30.472+00
7bfca5fa-afb4-4a3c-93c8-a8057e1ebb80	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	a27706b9-a21b-40f4-910e-8574f2067552	90.00	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10 09:13:08.147+00
f13659c0-9f01-4c51-8888-5f479fa0c70d	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	a8751076-3a68-4d11-babf-db54b80241ac	90.00	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10 09:13:27.271+00
e95606dc-6205-4cbf-8b72-4501a1475047	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	5bb22c48-2e12-462a-87eb-8efa81226132	95.00	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10 09:13:46.836+00
a489e31d-f7be-4374-94f8-f8f5c8dfee48	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	bcdada22-51c0-43c7-a90a-70a2234413d6	95.00	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10 09:13:50.591+00
ccc2b2d3-8279-48c2-afe8-9e597d73d1f5	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	6ba6d7b7-1afe-45c2-8aa1-4376dabf020b	85.00	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10 09:13:59.777+00
7870b2d6-7b4a-47b4-9417-d2edad4c76b2	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	926523f0-b2c3-449a-bf84-c562e3647b9e	49ae3a0f-8375-442e-bf7d-27b618ce4bdb	90.00	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10 09:14:06.236+00
e8bd2caa-c59a-4cee-bf22-f12d1044c9f9	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	bcdada22-51c0-43c7-a90a-70a2234413d6	85.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.357814+00
5d9a950c-62b4-4de7-b71f-12ea2cd15819	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	6ba6d7b7-1afe-45c2-8aa1-4376dabf020b	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.451728+00
73c93532-5841-400b-a28c-89f4ca1698f4	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	49ae3a0f-8375-442e-bf7d-27b618ce4bdb	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.54289+00
ab627b41-d96e-4b0e-b173-6c702f1acd86	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	e0d1bff4-8dc0-4af8-956c-a7beef990958	80.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.634657+00
a71fa4ff-31aa-48ba-906f-676f9e3a93a6	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	2d5c936b-00b0-4cd1-a7a3-b9e37220641f	80.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.726676+00
0f08102e-fe43-4a78-afc8-231a066c867d	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a27706b9-a21b-40f4-910e-8574f2067552	20.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.560827+00
c0d3015a-b490-4193-b8f7-6cf71b797f10	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a8751076-3a68-4d11-babf-db54b80241ac	1.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.656002+00
bf8e6d51-9777-4095-bda0-31f1f1897ef7	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	5bb22c48-2e12-462a-87eb-8efa81226132	10.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.74933+00
e9195a32-f149-454d-a62f-6da9de052b25	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	e0d1bff4-8dc0-4af8-956c-a7beef990958	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:52.894777+00
6682ef3c-84bc-4135-9d5b-f6b7cf32cc94	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	2d5c936b-00b0-4cd1-a7a3-b9e37220641f	95.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:52.990384+00
fad617fa-dd93-4d2e-bc98-03e27827c860	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a27706b9-a21b-40f4-910e-8574f2067552	95.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.082655+00
b8d5bc99-9de6-4c4d-bb1a-57f5a5507c9d	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a8751076-3a68-4d11-babf-db54b80241ac	95.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.173898+00
7f21da06-92ce-4b0d-8218-0833ef746da6	1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	5bb22c48-2e12-462a-87eb-8efa81226132	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.266276+00
14a227a4-29bc-4aef-aa76-4207fe29a34f	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a27706b9-a21b-40f4-910e-8574f2067552	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.821633+00
7d1d5d81-3432-48ad-b4da-6e493521066b	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a8751076-3a68-4d11-babf-db54b80241ac	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:53.913334+00
30542c18-18d8-4779-bd9a-679336f0de79	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	5bb22c48-2e12-462a-87eb-8efa81226132	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.00519+00
e35b1261-2a04-4f2f-8a97-cfa5256c88f0	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	bcdada22-51c0-43c7-a90a-70a2234413d6	90.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.09638+00
51950693-367b-4fc9-a2c9-39997d76f7a4	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	6ba6d7b7-1afe-45c2-8aa1-4376dabf020b	70.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.190919+00
aed89a5e-6f7c-40c5-860f-19ed0344f37f	03e9a3c3-ff61-4d9f-8701-a8e7764abb13	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	49ae3a0f-8375-442e-bf7d-27b618ce4bdb	70.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.282212+00
6e0c2dcb-0044-4b3c-a3b0-b122b98b225c	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	e0d1bff4-8dc0-4af8-956c-a7beef990958	89.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.374034+00
be4f33b1-e49b-485f-9797-f92266cc3bac	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	2d5c936b-00b0-4cd1-a7a3-b9e37220641f	20.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.469679+00
84549b6c-8b38-48e9-86f5-b992cc9b87f4	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	bcdada22-51c0-43c7-a90a-70a2234413d6	10.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.841277+00
a99f00cf-c660-4c4d-ac67-1c8e7ea5484a	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	6ba6d7b7-1afe-45c2-8aa1-4376dabf020b	5.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:54.933538+00
9e07f641-bb89-419e-bf90-0d71e3c1d495	4c786784-da22-41c6-8c9d-1ec523993c1b	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	49ae3a0f-8375-442e-bf7d-27b618ce4bdb	2.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.024758+00
fbca002e-29b9-41e3-8acb-7f1861ed727c	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	e0d1bff4-8dc0-4af8-956c-a7beef990958	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.116438+00
76934062-fcf2-40a2-ad8d-423b20b3ae37	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	2d5c936b-00b0-4cd1-a7a3-b9e37220641f	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.209143+00
25467dcb-0760-4ffa-b1a3-65a657898f18	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a27706b9-a21b-40f4-910e-8574f2067552	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.30039+00
06570543-110e-42bd-90fb-8fac468a67bd	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	a8751076-3a68-4d11-babf-db54b80241ac	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.391807+00
f19857f9-9aac-4319-9781-93c1ed52f3d1	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	5bb22c48-2e12-462a-87eb-8efa81226132	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.483118+00
f250c20d-6bde-4235-906d-cb130ec1a1b0	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	bcdada22-51c0-43c7-a90a-70a2234413d6	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.575206+00
69678d84-98e2-4f0f-bb5f-58a59b1faa5c	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	6ba6d7b7-1afe-45c2-8aa1-4376dabf020b	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.667341+00
f6996602-62d2-4a95-9e52-da0a40a4d398	a5ff6341-3948-442d-a34f-9d9a1a11c519	3f3b741f-99c3-4d63-8f45-244f94deed2f	216c63a2-9fad-472a-b2de-7e975d4acd64	49ae3a0f-8375-442e-bf7d-27b618ce4bdb	0.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-11 09:39:55.791549+00
\.


--
-- Data for Name: report_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_cards (id, class_id, student_id, semester_id, status, general_note, finalized_by, finalized_at, distributed_by, distributed_at, created_at) FROM stdin;
\.


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.semesters (id, academic_year_id, name, is_active) FROM stdin;
a7956b50-2150-4fc4-af68-63cc603523a7	6e58eab5-f16c-4b0b-82f9-0a17aeee917d	Ganjil	t
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.students (id, nis, name, password_hash, created_at, nis_legacy_bigint) FROM stdin;
1b1246eb-a8d4-427b-90a7-7b1426ab1c4a	2025100004	Farhan	$2a$10$dSYoXl9vfbBtYja/MlkpXe1vcInVO9NV3C1Na55Yrwh6XkHz2ylxi	2026-08-10 07:23:38.892+00	2025100004
03e9a3c3-ff61-4d9f-8701-a8e7764abb13	392333374585888	Jingga Fahirah	$2a$10$xyVSIjGeGnpz51HxnmJ8j.XX/u5/M2wLiA2aN94HLDxSXAAkFXOou	2026-08-10 06:46:35.305+00	392333374585888
4c786784-da22-41c6-8c9d-1ec523993c1b	20202989476283	Mikguk Soo	$2a$10$btsILBxHkYuuqydDnKKyde1uTy74sMwkcggtpW/ul5rdnJPEKYC3u	2026-08-10 06:46:35.703+00	20202989476283
07e280eb-9431-4bfd-b49c-755ddb714b37	2026100123	Siti Aminah	$2a$10$Qjm66WMCYVL.0P.UXUmEqOyfi/AAXYdb/FSSOIoTznKikWvor2xBm	2026-08-06 12:11:06.933+00	2026100123
a5ff6341-3948-442d-a34f-9d9a1a11c519	304895758393020	Tika Massala	$2a$10$rwcy/s45fMJ3gFgLo22kCOm/Yw.ZBNsd9a1JP5Ys.BthIcdKNbclq	2026-08-10 06:46:35.521+00	304895758393020
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subjects (id, name, grade_level, kkm, teacher_id, created_at) FROM stdin;
216c63a2-9fad-472a-b2de-7e975d4acd64	Matematika	X	75.00	c8d54398-7490-40ff-98ce-321e67e981f6	2026-08-10 07:28:26.201+00
926523f0-b2c3-449a-bf84-c562e3647b9e	Fisika	X	80.00	06bbf474-75d9-4583-88f3-2e24f3778804	2026-08-10 07:30:23.238+00
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teachers (id, nip, name, password_hash, created_at, nip_legacy_real) FROM stdin;
39a6702f-e120-412e-b78a-4dda547dde53	198501000000000000	Budi Santoso	$2a$10$1KaxRYZzACs3N1PghLIiqOWuMUKK42yeh5qwchwZxmwH9VJqYEgwW	2026-08-06 08:11:02.148+00	1.9850102e+17
c8d54398-7490-40ff-98ce-321e67e981f6	1987010000000000	Budi Santoso	$2a$10$jziBgf70LaoUc7COubcRweu.cEOxvTMYadHkp2uxLsdUDN3a5xXSW	2026-08-10 06:49:25.852+00	1.9870101e+15
06bbf474-75d9-4583-88f3-2e24f3778804	23874500000000000000000	Nining S.Pd.	$2a$10$d9mfF2XRIwHouXvdHtHjHeP/FsP9eG8cJ4ybKFltSz3P3ywn7yw7K	2026-08-10 06:36:09.865+00	2.387451e+22
\.


--
-- Name: academic_years academic_years_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_name_key UNIQUE (name);


--
-- Name: academic_years academic_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);


--
-- Name: administrators administrators_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_email_key UNIQUE (email);


--
-- Name: administrators administrators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_pkey PRIMARY KEY (id);


--
-- Name: assessment_components assessment_components_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_components
    ADD CONSTRAINT assessment_components_code_key UNIQUE (code);


--
-- Name: assessment_components assessment_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_components
    ADD CONSTRAINT assessment_components_pkey PRIMARY KEY (id);


--
-- Name: assessment_topics assessment_topics_class_subject_component_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_topics
    ADD CONSTRAINT assessment_topics_class_subject_component_key UNIQUE (class_id, subject_id, component_id);


--
-- Name: assessment_topics assessment_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_topics
    ADD CONSTRAINT assessment_topics_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_session_student_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_session_student_key UNIQUE (session_id, student_id);


--
-- Name: attendance_sessions attendance_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT attendance_sessions_pkey PRIMARY KEY (id);


--
-- Name: attendance_sessions attendance_sessions_teacher_class_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT attendance_sessions_teacher_class_date_key UNIQUE (teacher_id, class_id, session_date);


--
-- Name: class_students class_students_class_student_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_class_student_key UNIQUE (class_id, student_id);


--
-- Name: class_students class_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_pkey PRIMARY KEY (id);


--
-- Name: class_subjects class_subjects_class_subject_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_class_subject_key UNIQUE (class_id, subject_id);


--
-- Name: class_subjects class_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_pkey PRIMARY KEY (id);


--
-- Name: classes classes_name_semester_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_name_semester_key UNIQUE (name, semester_id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: grades grades_student_subject_component_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_subject_component_key UNIQUE (student_id, subject_id, component_id);


--
-- Name: report_cards report_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_pkey PRIMARY KEY (id);


--
-- Name: report_cards report_cards_student_semester_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_student_semester_key UNIQUE (student_id, semester_id);


--
-- Name: semesters semesters_academic_year_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_academic_year_name_key UNIQUE (academic_year_id, name);


--
-- Name: semesters semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (id);


--
-- Name: students students_nis_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_nis_key UNIQUE (nis);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_name_grade_level_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_name_grade_level_key UNIQUE (name, grade_level);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_teacher_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_teacher_id_key UNIQUE (teacher_id);


--
-- Name: teachers teachers_nip_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_nip_key UNIQUE (nip);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: idx_assessment_topics_component; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessment_topics_component ON public.assessment_topics USING btree (component_id);


--
-- Name: idx_assessment_topics_teacher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessment_topics_teacher ON public.assessment_topics USING btree (updated_by_teacher_id);


--
-- Name: idx_attendance_sessions_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_sessions_class ON public.attendance_sessions USING btree (class_id, session_date);


--
-- Name: idx_attendance_sessions_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_sessions_subject ON public.attendance_sessions USING btree (subject_id);


--
-- Name: idx_class_students_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_class_students_student ON public.class_students USING btree (student_id);


--
-- Name: idx_classes_homeroom_teacher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_classes_homeroom_teacher ON public.classes USING btree (homeroom_teacher_id);


--
-- Name: idx_classes_semester; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_classes_semester ON public.classes USING btree (semester_id);


--
-- Name: idx_grades_class_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grades_class_subject ON public.grades USING btree (class_id, subject_id);


--
-- Name: idx_grades_filled_by_teacher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grades_filled_by_teacher ON public.grades USING btree (filled_by_teacher_id);


--
-- Name: idx_grades_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grades_student ON public.grades USING btree (student_id);


--
-- Name: idx_report_cards_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_cards_class ON public.report_cards USING btree (class_id, semester_id);


--
-- Name: idx_report_cards_distributed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_cards_distributed_by ON public.report_cards USING btree (distributed_by);


--
-- Name: idx_report_cards_finalized_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_report_cards_finalized_by ON public.report_cards USING btree (finalized_by);


--
-- Name: assessment_topics trg_assessment_topics_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_assessment_topics_updated_at BEFORE UPDATE ON public.assessment_topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: attendance_records trg_attendance_records_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_attendance_records_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: grades trg_grades_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: assessment_topics assessment_topics_class_subject_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_topics
    ADD CONSTRAINT assessment_topics_class_subject_fkey FOREIGN KEY (class_id, subject_id) REFERENCES public.class_subjects(class_id, subject_id) ON DELETE CASCADE;


--
-- Name: assessment_topics assessment_topics_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_topics
    ADD CONSTRAINT assessment_topics_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.assessment_components(id) ON DELETE RESTRICT;


--
-- Name: assessment_topics assessment_topics_updated_by_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_topics
    ADD CONSTRAINT assessment_topics_updated_by_teacher_id_fkey FOREIGN KEY (updated_by_teacher_id) REFERENCES public.teachers(id) ON DELETE RESTRICT;


--
-- Name: attendance_records attendance_records_session_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_session_fkey FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_student_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_student_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE RESTRICT;


--
-- Name: attendance_sessions attendance_sessions_class_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT attendance_sessions_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: attendance_sessions attendance_sessions_subject_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT attendance_sessions_subject_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- Name: attendance_sessions attendance_sessions_teacher_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_sessions
    ADD CONSTRAINT attendance_sessions_teacher_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE RESTRICT;


--
-- Name: class_students class_students_class_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: class_students class_students_student_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_students
    ADD CONSTRAINT class_students_student_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE RESTRICT;


--
-- Name: class_subjects class_subjects_class_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: class_subjects class_subjects_subject_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.class_subjects
    ADD CONSTRAINT class_subjects_subject_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- Name: classes classes_homeroom_teacher_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_homeroom_teacher_fkey FOREIGN KEY (homeroom_teacher_id) REFERENCES public.teachers(id) ON DELETE RESTRICT;


--
-- Name: classes classes_semester_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_semester_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id) ON DELETE RESTRICT;


--
-- Name: grades grades_class_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE RESTRICT;


--
-- Name: grades grades_component_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_component_fkey FOREIGN KEY (component_id) REFERENCES public.assessment_components(id) ON DELETE RESTRICT;


--
-- Name: grades grades_filled_by_teacher_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_filled_by_teacher_fkey FOREIGN KEY (filled_by_teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;


--
-- Name: grades grades_student_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE RESTRICT;


--
-- Name: grades grades_subject_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_subject_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- Name: report_cards report_cards_class_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_class_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE RESTRICT;


--
-- Name: report_cards report_cards_distributed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_distributed_by_fkey FOREIGN KEY (distributed_by) REFERENCES public.teachers(id);


--
-- Name: report_cards report_cards_finalized_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_finalized_by_fkey FOREIGN KEY (finalized_by) REFERENCES public.teachers(id);


--
-- Name: report_cards report_cards_semester_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_semester_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id) ON DELETE RESTRICT;


--
-- Name: report_cards report_cards_student_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_student_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE RESTRICT;


--
-- Name: semesters semesters_academic_year_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_academic_year_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE RESTRICT;


--
-- Name: subjects subjects_teacher_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_teacher_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE RESTRICT;


--
-- Name: academic_years; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

--
-- Name: administrators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_components; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_components ENABLE ROW LEVEL SECURITY;

--
-- Name: assessment_topics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessment_topics ENABLE ROW LEVEL SECURITY;

--
-- Name: attendance_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

--
-- Name: attendance_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: class_students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

--
-- Name: class_subjects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

--
-- Name: grades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

--
-- Name: report_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: semesters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

--
-- Name: students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

--
-- Name: subjects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

--
-- Name: teachers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict bPmp4aylA75sVk11rVAVEXP2BQvEsLuRqEoWThdXswJB8zJRgmRmSBPYmHxSiYG
