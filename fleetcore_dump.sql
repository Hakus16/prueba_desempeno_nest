--
-- PostgreSQL database dump
--

\restrict qdto7woZfjSIyPdMu53hnTgRE6yMBZpdPDHqCUOhXQwM0osEhZgBxC5RQAYmfxL

-- Dumped from database version 14.19 (Ubuntu 14.19-1.pgdg22.04+1)
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-1.pgdg22.04+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: maintenances_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenances_status_enum AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.maintenances_status_enum OWNER TO postgres;

--
-- Name: maintenances_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenances_type_enum AS ENUM (
    'PREVENTIVE',
    'CORRECTIVE'
);


ALTER TYPE public.maintenances_type_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'TECHNICIAN'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: vehicles_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehicles_status_enum AS ENUM (
    'AVAILABLE',
    'IN_MAINTENANCE',
    'INACTIVE'
);


ALTER TYPE public.vehicles_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenances (
    id integer NOT NULL,
    type public.maintenances_type_enum NOT NULL,
    description character varying NOT NULL,
    "initialMileage" integer NOT NULL,
    "scheduledDate" timestamp with time zone NOT NULL,
    "estimatedEndDate" timestamp with time zone,
    status public.maintenances_status_enum DEFAULT 'SCHEDULED'::public.maintenances_status_enum NOT NULL,
    "workDone" text,
    "finalCost" numeric(12,2),
    "completedAt" timestamp with time zone,
    "finalMileage" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    vehicle_id integer,
    mechanic_id integer,
    workshop_id integer
);


ALTER TABLE public.maintenances OWNER TO postgres;

--
-- Name: maintenances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenances_id_seq OWNER TO postgres;

--
-- Name: maintenances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenances_id_seq OWNED BY public.maintenances.id;


--
-- Name: mechanics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mechanics (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    specialty character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer
);


ALTER TABLE public.mechanics OWNER TO postgres;

--
-- Name: mechanics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mechanics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mechanics_id_seq OWNER TO postgres;

--
-- Name: mechanics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mechanics_id_seq OWNED BY public.mechanics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.users_role_enum DEFAULT 'TECHNICIAN'::public.users_role_enum NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    plate character varying NOT NULL,
    brand character varying NOT NULL,
    model character varying NOT NULL,
    year integer NOT NULL,
    mileage integer NOT NULL,
    status public.vehicles_status_enum DEFAULT 'AVAILABLE'::public.vehicles_status_enum NOT NULL,
    "deletedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: workshops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workshops (
    id integer NOT NULL,
    name character varying NOT NULL,
    address character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workshops OWNER TO postgres;

--
-- Name: workshops_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workshops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workshops_id_seq OWNER TO postgres;

--
-- Name: workshops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workshops_id_seq OWNED BY public.workshops.id;


--
-- Name: maintenances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances ALTER COLUMN id SET DEFAULT nextval('public.maintenances_id_seq'::regclass);


--
-- Name: mechanics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics ALTER COLUMN id SET DEFAULT nextval('public.mechanics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: workshops id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workshops ALTER COLUMN id SET DEFAULT nextval('public.workshops_id_seq'::regclass);


--
-- Data for Name: maintenances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenances (id, type, description, "initialMileage", "scheduledDate", "estimatedEndDate", status, "workDone", "finalCost", "completedAt", "finalMileage", "createdAt", "updatedAt", vehicle_id, mechanic_id, workshop_id) FROM stdin;
1	CORRECTIVE	Reparación de sistema de embrague y caja de cambios	125000	2026-10-27 06:34:52.977-05	2026-10-27 10:34:52.977-05	IN_PROGRESS	\N	\N	\N	\N	2026-10-27 07:34:52.977298	2026-10-27 07:34:52.977298	3	1	1
2	PREVENTIVE	Cambio de aceite, filtros y chequeo de frenos	40000	2026-09-27 07:34:52.979-05	2026-09-27 10:34:52.979-05	COMPLETED	Cambio de aceite sintético 15W-40, filtro de aceite y filtro de aire	350000.00	2026-09-27 10:34:52.979-05	40150	2026-10-27 07:34:52.979767	2026-10-27 07:34:52.979767	1	1	1
\.


--
-- Data for Name: mechanics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mechanics (id, name, email, specialty, "isActive", "createdAt", "updatedAt", user_id) FROM stdin;
1	Carlos Pérez	carlos.perez@fleetcore.com	Mantenimiento Preventivo y Motores	t	2026-10-27 07:34:52.959152	2026-10-27 07:34:52.959152	2
2	Laura Gómez	laura.gomez@fleetcore.com	Frenos y Suspensión	t	2026-10-27 07:34:52.961493	2026-10-27 07:34:52.961493	3
3	Roberto Díaz	roberto.diaz@fleetcore.com	Sistemas Eléctricos	f	2026-10-27 07:34:52.963113	2026-10-27 07:34:52.963113	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, role, "isActive", "createdAt", "updatedAt") FROM stdin;
1	admin@fleetcore.com	$2b$10$ikQPMMS.fSZcaCzUntmKrOhoY7WjQgMXZC9e0pznSOSYDmje7cyWq	ADMIN	t	2026-10-27 07:34:52.949122	2026-10-27 07:34:52.949122
2	carlos.perez@fleetcore.com	$2b$10$ikQPMMS.fSZcaCzUntmKrOhoY7WjQgMXZC9e0pznSOSYDmje7cyWq	TECHNICIAN	t	2026-10-27 07:34:52.953855	2026-10-27 07:34:52.953855
3	laura.gomez@fleetcore.com	$2b$10$ikQPMMS.fSZcaCzUntmKrOhoY7WjQgMXZC9e0pznSOSYDmje7cyWq	TECHNICIAN	t	2026-10-27 07:34:52.955935	2026-10-27 07:34:52.955935
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, plate, brand, model, year, mileage, status, "deletedAt", "createdAt", "updatedAt") FROM stdin;
1	ABC123	Chevrolet	NPR	2022	45000	AVAILABLE	\N	2026-10-27 07:34:52.968133	2026-10-27 07:34:52.968133
2	XYZ789	Hino	Dutro City	2021	62000	AVAILABLE	\N	2026-10-27 07:34:52.970891	2026-10-27 07:34:52.970891
3	DEF456	Kenworth	T800	2020	125000	IN_MAINTENANCE	\N	2026-10-27 07:34:52.972612	2026-10-27 07:34:52.972612
4	GHI999	International	WorkStar	2018	210000	INACTIVE	\N	2026-10-27 07:34:52.973936	2026-10-27 07:34:52.973936
\.


--
-- Data for Name: workshops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workshops (id, name, address, "isActive", "createdAt", "updatedAt") FROM stdin;
1	Taller Norte Principal	Av. Cra 68 # 80-20, Bogotá	t	2026-10-27 07:34:52.964725	2026-10-27 07:34:52.964725
2	Taller Sur Auxiliar	Calle 45 Sur # 12-34, Bogotá	f	2026-10-27 07:34:52.966204	2026-10-27 07:34:52.966204
\.


--
-- Name: maintenances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenances_id_seq', 2, true);


--
-- Name: mechanics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mechanics_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 4, true);


--
-- Name: workshops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workshops_id_seq', 2, true);


--
-- Name: vehicles PK_18d8646b59304dce4af3a9e35b6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY (id);


--
-- Name: mechanics PK_2c0ed23afc0cc7ff361c17e53df; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "PK_2c0ed23afc0cc7ff361c17e53df" PRIMARY KEY (id);


--
-- Name: maintenances PK_62403473bd524a42d58589aa78b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "PK_62403473bd524a42d58589aa78b" PRIMARY KEY (id);


--
-- Name: workshops PK_6d0e82a124f5b53df91c8989848; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT "PK_6d0e82a124f5b53df91c8989848" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: mechanics REL_4e69c5d1d5ef843a571535ccfd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "REL_4e69c5d1d5ef843a571535ccfd" UNIQUE (user_id);


--
-- Name: mechanics UQ_301c3b5fa2d49aab65dcfda36a6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "UQ_301c3b5fa2d49aab65dcfda36a6" UNIQUE (email);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: vehicles UQ_ec7181ebdab798d97070122a5bf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "UQ_ec7181ebdab798d97070122a5bf" UNIQUE (plate);


--
-- Name: mechanics FK_4e69c5d1d5ef843a571535ccfde; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "FK_4e69c5d1d5ef843a571535ccfde" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: maintenances FK_a47e3420d123ccf06ab72e1969c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_a47e3420d123ccf06ab72e1969c" FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE RESTRICT;


--
-- Name: maintenances FK_d501088741618ca66074d85e411; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_d501088741618ca66074d85e411" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE RESTRICT;


--
-- Name: maintenances FK_f92519be34af2de954da0bd4a47; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_f92519be34af2de954da0bd4a47" FOREIGN KEY (mechanic_id) REFERENCES public.mechanics(id) ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict qdto7woZfjSIyPdMu53hnTgRE6yMBZpdPDHqCUOhXQwM0osEhZgBxC5RQAYmfxL

