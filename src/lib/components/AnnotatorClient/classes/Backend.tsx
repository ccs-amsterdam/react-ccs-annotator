import Axios, { AxiosInstance } from "axios";
import { Annotation, Job, JobAnnotation, JobSettings, Status, User } from "../../../types";

export async function passwordLogin(host, email, password) {
  const d = new FormData();
  d.append("username", email);
  d.append("password", password);
  const response = await Axios.post(`${host}/annotator/users/me/token`, d);
  return response.data.token;
}

export async function redeemJobToken(host, token, user_id) {
  const params = { token, user_id };
  const res = await Axios.get(`${host}/annotator/guest/jobtoken`, { params });
  return res.data;
}

interface AuthToken {
  token: string;
  email: string;
  is_admin: boolean;
  restricted_job: number;
}

class Backend {
  host: string;
  token: string;
  api: AxiosInstance;
  is_admin: boolean;
  email: string;
  restricted_job: number;

  constructor(host, token) {
    this.host = host;
    this.token = token;
    this.api = Axios.create({
      baseURL: host,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async init() {
    const d = await this.getToken();
    this.email = d.email;
    this.is_admin = d.is_admin;
    this.token = d.token; //getToken should give a refreshed token, which is set to localstorage in useBackend
    this.restricted_job = d.restricted_job;
  }

  // GET

  async getToken(user: string = undefined): Promise<AuthToken> {
    const path = `annotator/users/${user || "me"}/token`;
    const res = await this.api.get(path);
    return res.data;
  }
  async getJobToken(job_id: number): Promise<string> {
    const res = await this.api.get(`annotator/codingjob/${job_id}/token`);
    return res.data.token;
  }
  async getUsers(): Promise<User[]> {
    const res = await this.api.get("annotator/users");
    return res.data.users;
  }
  async getCodebook(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}/codebook`);
    return res.data;
  }
  async getProgress(job_id) {
    const res = await this.api.get(`annotator/codingjob/${job_id}/progress`);
    return res.data;
  }
  async getUnit(job_id, i) {
    let path = `annotator/codingjob/${job_id}/unit`;
    if (i !== null) path += `?index=${i}`;
    const res = await this.api.get(path);
    return res.data;
  }
  async getCodingjob(job_id: number): Promise<Job> {
    const res = await this.api.get(`annotator/codingjob/${job_id}`);
    return res.data;
  }
  async getCodingjobDetails(job_id: number): Promise<Job> {
    const res = await this.api.get(`annotator/codingjob/${job_id}/details`);
    return res.data;
  }
  async getCodingjobAnnotations(job_id: number): Promise<JobAnnotation[]> {
    const res = await this.api.get(`annotator/codingjob/${job_id}/annotations`);
    return res.data;
  }
  async getAllJobs(): Promise<Job[]> {
    const res = await this.api.get("annotator/codingjob");
    return res.data.jobs;
  }
  async getUserJobs(user?: string): Promise<Job[]> {
    const path = `annotator/users/${user || "me"}/codingjob`;
    const res = await this.api.get(path);
    return res.data.jobs;
  }
  async getDebriefing(job_id: number) {
    const path = `annotator/codingjob/${job_id}/debriefing`;
    const res = await this.api.get(path);
    return res.data;
  }

  // POST
  postPassword(user?: string, password?: string) {
    const body = { password };
    return this.api.post(`annotator/users/${user || "me"}`, body);
  }
  postUsers(users: User[]) {
    return this.api.post("annotator/users", {
      users,
    });
  }
  postAnnotation(job_id: number, unit_id: number, annotation: Annotation[], status: Status) {
    const data = { annotation, status };
    return this.api.post(`annotator/codingjob/${job_id}/unit/${unit_id}/annotation`, data);
  }
  async setJobSettings(job_id: number, settingsObj: JobSettings): Promise<void> {
    return await this.api.post(`annotator/codingjob/${job_id}/settings`, settingsObj);
  }
  async setJobUsers(job_id: number, users: User[], only_add: boolean) {
    const body = { users, only_add };
    return await this.api.post(`annotator/codingjob/${job_id}/users`, body);
  }
}

export default Backend;