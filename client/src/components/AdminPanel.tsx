import type { Dispatch, SetStateAction } from "react";
import {
  initialCategoryForm,
  initialPackageForm,
  initialTrainerForm,
  initialUserForm,
  initialVideoForm,
} from "../appDefaults";
import type { CopySet } from "../appCopy";
import type {
  AdminSection,
  CategoryFormState,
  PackageFormState,
  TrainerFormState,
  UserFormState,
  VideoFormState,
} from "../appTypes";
import { formatDate, formatPrice } from "../appHelpers";
import type {
  Category,
  SubscriptionPlan,
  Trainer,
  User,
  UserSubscription,
  Video,
} from "../types";
import { Field, SectionHeader } from "./Common";

type AdminPanelProps = {
  t: CopySet;
  adminSections: Array<{ id: AdminSection; title: string; count: number }>;
  activeAdminSection: { id: AdminSection; title: string; count: number };
  adminSection: AdminSection;
  setAdminWorkspace: (section: AdminSection) => void;
  adminSearch: string;
  setAdminSearch: Dispatch<SetStateAction<string>>;
  categories: Category[];
  trainers: Trainer[];
  videos: Video[];
  packages: SubscriptionPlan[];
  subscriptions: UserSubscription[];
  filteredCategories: Category[];
  filteredTrainers: Trainer[];
  filteredPackages: SubscriptionPlan[];
  filteredVideos: Video[];
  filteredUsers: User[];
  categoryForm: CategoryFormState;
  setCategoryForm: Dispatch<SetStateAction<CategoryFormState>>;
  trainerForm: TrainerFormState;
  setTrainerForm: Dispatch<SetStateAction<TrainerFormState>>;
  packageForm: PackageFormState;
  setPackageForm: Dispatch<SetStateAction<PackageFormState>>;
  videoForm: VideoFormState;
  setVideoForm: Dispatch<SetStateAction<VideoFormState>>;
  userForm: UserFormState;
  setUserForm: Dispatch<SetStateAction<UserFormState>>;
  editingCategoryId: number | null;
  setEditingCategoryId: Dispatch<SetStateAction<number | null>>;
  editingTrainerId: number | null;
  setEditingTrainerId: Dispatch<SetStateAction<number | null>>;
  editingPackageId: number | null;
  setEditingPackageId: Dispatch<SetStateAction<number | null>>;
  editingVideoId: number | null;
  setEditingVideoId: Dispatch<SetStateAction<number | null>>;
  editingUserId: number | null;
  setEditingUserId: Dispatch<SetStateAction<number | null>>;
  editingUserActiveSubscription: UserSubscription | null;
  fillCategoryForm: (category: Category) => void;
  fillTrainerForm: (trainer: Trainer) => void;
  fillPackageForm: (subscriptionPlan: SubscriptionPlan) => void;
  fillVideoForm: (video: Video) => void;
  fillUserForm: (user: User) => void;
  handleSaveCategory: () => void;
  handleDeleteCategory: (categoryId: number) => void;
  handleSaveTrainer: () => void;
  handleDeleteTrainer: (trainerId: number) => void;
  handleSavePackage: () => void;
  handleDeletePackage: (planId: number) => void;
  handleSaveVideo: () => void;
  handleDeleteVideo: (videoId: number) => void;
  handleSaveUser: () => void;
  handleAssignSubscriptionToUser: () => void;
  handleDeleteUser: (userId: number) => void;
};

export function AdminPanel({
  t,
  adminSections,
  activeAdminSection,
  adminSection,
  setAdminWorkspace,
  adminSearch,
  setAdminSearch,
  categories,
  trainers,
  videos,
  packages,
  subscriptions,
  filteredCategories,
  filteredTrainers,
  filteredPackages,
  filteredVideos,
  filteredUsers,
  categoryForm,
  setCategoryForm,
  trainerForm,
  setTrainerForm,
  packageForm,
  setPackageForm,
  videoForm,
  setVideoForm,
  userForm,
  setUserForm,
  editingCategoryId,
  setEditingCategoryId,
  editingTrainerId,
  setEditingTrainerId,
  editingPackageId,
  setEditingPackageId,
  editingVideoId,
  setEditingVideoId,
  editingUserId,
  setEditingUserId,
  editingUserActiveSubscription,
  fillCategoryForm,
  fillTrainerForm,
  fillPackageForm,
  fillVideoForm,
  fillUserForm,
  handleSaveCategory,
  handleDeleteCategory,
  handleSaveTrainer,
  handleDeleteTrainer,
  handleSavePackage,
  handleDeletePackage,
  handleSaveVideo,
  handleDeleteVideo,
  handleSaveUser,
  handleAssignSubscriptionToUser,
  handleDeleteUser,
}: AdminPanelProps) {
  return (
    <section className="content-panel">
      <SectionHeader
        eyebrow={t.nav.admin}
        title={t.adminTitle}
        text={`${t.adminText} ${t.adminWorkspaceHint}`}
      />

      <div className="admin-overview-grid">
        {adminSections.map((section) => (
          <button
            key={section.id}
            className={adminSection === section.id ? "admin-summary-card active" : "admin-summary-card"}
            type="button"
            onClick={() => setAdminWorkspace(section.id)}
          >
            <span>{section.title}</span>
            <strong>{section.count}</strong>
          </button>
        ))}
      </div>

      <div className="admin-switcher">
        {adminSections.map((section) => (
          <button
            key={section.id}
            className={adminSection === section.id ? "admin-switch active" : "admin-switch"}
            type="button"
            onClick={() => setAdminWorkspace(section.id)}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-copy">
          <span className="section-eyebrow">{activeAdminSection.title}</span>
          <p>{t.adminWorkspaceHint}</p>
        </div>
        <div className="admin-toolbar-actions">
          <Field label={t.searchLabel}>
            <input
              type="text"
              value={adminSearch}
              placeholder={t.adminSearchPlaceholder}
              onChange={(event) => setAdminSearch(event.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="admin-grid">
        {adminSection === "categories" ? (
          <article className="admin-card">
            <h3>{t.categoryManager}</h3>
            <Field label={t.categoryFilter}>
              <input
                type="text"
                value={categoryForm.categoryName}
                onChange={(event) => setCategoryForm({ categoryName: event.target.value })}
              />
            </Field>
            <div className="card-actions">
              <button className="small-action" type="button" onClick={handleSaveCategory}>
                {t.save}
              </button>
              <button
                className="small-action ghost"
                type="button"
                onClick={() => {
                  setEditingCategoryId(null);
                  setCategoryForm(initialCategoryForm);
                }}
              >
                {t.cancel}
              </button>
            </div>
            <div className="mini-list">
              {filteredCategories.length ? (
                filteredCategories.map((category) => (
                  <article
                    className={editingCategoryId === category.categoryId ? "selectable-row active" : "selectable-row"}
                    key={category.categoryId}
                  >
                    <strong>{category.categoryName}</strong>
                    <div className="row-meta">
                      <span>{videos.filter((video) => video.categoryId === category.categoryId).length} {t.statsVideos.toLowerCase()}</span>
                    </div>
                    <div className="row-actions">
                      <button className="tiny-button" type="button" onClick={() => fillCategoryForm(category)}>
                        {t.edit}
                      </button>
                      <button className="tiny-button danger" type="button" onClick={() => handleDeleteCategory(category.categoryId)}>
                        {t.delete}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card inline-empty">{t.adminNoMatches}</article>
              )}
            </div>
          </article>
        ) : null}

        {adminSection === "trainers" ? (
          <article className="admin-card">
            <h3>{t.trainerManager}</h3>
            <Field label={t.authName}>
              <input
                type="text"
                value={trainerForm.trainerName}
                onChange={(event) =>
                  setTrainerForm((current) => ({ ...current, trainerName: event.target.value }))
                }
              />
            </Field>
            <Field label={t.trainerBio}>
              <textarea
                value={trainerForm.bio}
                onChange={(event) =>
                  setTrainerForm((current) => ({ ...current, bio: event.target.value }))
                }
              />
            </Field>
            <Field label={t.startDate}>
              <input
                type="date"
                value={trainerForm.startDate}
                onChange={(event) =>
                  setTrainerForm((current) => ({ ...current, startDate: event.target.value }))
                }
              />
            </Field>
            <div className="card-actions">
              <button className="small-action" type="button" onClick={handleSaveTrainer}>
                {t.save}
              </button>
              <button
                className="small-action ghost"
                type="button"
                onClick={() => {
                  setEditingTrainerId(null);
                  setTrainerForm(initialTrainerForm);
                }}
              >
                {t.cancel}
              </button>
            </div>
            <div className="mini-list">
              {filteredTrainers.length ? (
                filteredTrainers.map((trainer) => (
                  <article
                    className={editingTrainerId === trainer.trainerId ? "selectable-row active" : "selectable-row"}
                    key={trainer.trainerId}
                  >
                    <strong>{trainer.trainerName}</strong>
                    <div className="row-meta">
                      <span>{videos.filter((video) => video.trainerId === trainer.trainerId).length} {t.statsVideos.toLowerCase()}</span>
                      <span>{formatDate(trainer.startDate)}</span>
                    </div>
                    <div className="row-actions">
                      <button className="tiny-button" type="button" onClick={() => fillTrainerForm(trainer)}>
                        {t.edit}
                      </button>
                      <button className="tiny-button danger" type="button" onClick={() => handleDeleteTrainer(trainer.trainerId)}>
                        {t.delete}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card inline-empty">{t.adminNoMatches}</article>
              )}
            </div>
          </article>
        ) : null}

        {adminSection === "packages" ? (
          <article className="admin-card">
            <h3>{t.packageManager}</h3>
            <Field label={t.playlistName}>
              <input
                type="text"
                value={packageForm.planName}
                onChange={(event) =>
                  setPackageForm((current) => ({ ...current, planName: event.target.value }))
                }
              />
            </Field>
            <Field label={t.price}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={packageForm.price}
                onChange={(event) =>
                  setPackageForm((current) => ({ ...current, price: event.target.value }))
                }
              />
            </Field>
            <Field label={t.durationMonths}>
              <input
                type="number"
                min="1"
                value={packageForm.durationMonths}
                onChange={(event) =>
                  setPackageForm((current) => ({ ...current, durationMonths: event.target.value }))
                }
              />
            </Field>
            <div className="card-actions">
              <button className="small-action" type="button" onClick={handleSavePackage}>
                {t.save}
              </button>
              <button
                className="small-action ghost"
                type="button"
                onClick={() => {
                  setEditingPackageId(null);
                  setPackageForm(initialPackageForm);
                }}
              >
                {t.cancel}
              </button>
            </div>
            <div className="mini-list">
              {filteredPackages.length ? (
                filteredPackages.map((subscriptionPlan) => (
                  <article
                    className={editingPackageId === subscriptionPlan.planId ? "selectable-row active" : "selectable-row"}
                    key={subscriptionPlan.planId}
                  >
                    <strong>{subscriptionPlan.planName}</strong>
                    <div className="row-meta">
                      <span>{formatPrice(subscriptionPlan.price)}</span>
                      <span>{subscriptionPlan.durationMonths} {t.durationMonths.toLowerCase()}</span>
                    </div>
                    <div className="row-actions">
                      <button className="tiny-button" type="button" onClick={() => fillPackageForm(subscriptionPlan)}>
                        {t.edit}
                      </button>
                      <button className="tiny-button danger" type="button" onClick={() => handleDeletePackage(subscriptionPlan.planId)}>
                        {t.delete}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card inline-empty">{t.adminNoMatches}</article>
              )}
            </div>
          </article>
        ) : null}

        {adminSection === "videos" ? (
          <article className="admin-card admin-card-wide">
            <h3>{t.videoManager}</h3>
            <div className="admin-form-grid">
              <Field label={t.authName}>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(event) =>
                    setVideoForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.duration}>
                <input
                  type="number"
                  min="1"
                  value={videoForm.duration}
                  onChange={(event) =>
                    setVideoForm((current) => ({ ...current, duration: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.videoUrl}>
                <input
                  type="url"
                  value={videoForm.videoURL}
                  onChange={(event) =>
                    setVideoForm((current) => ({ ...current, videoURL: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.language}>
                <input
                  type="text"
                  value={videoForm.language}
                  onChange={(event) =>
                    setVideoForm((current) => ({ ...current, language: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.equipment}>
                <input
                  type="text"
                  value={videoForm.equipment}
                  onChange={(event) =>
                    setVideoForm((current) => ({ ...current, equipment: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.trainerFilter}>
                <select
                  value={videoForm.trainerId}
                  onChange={(event) =>
                    setVideoForm((current) => ({ ...current, trainerId: event.target.value }))
                  }
                >
                  <option value="">-</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.trainerId} value={trainer.trainerId}>
                      {trainer.trainerName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t.categoryFilter}>
                <select
                  value={videoForm.categoryId}
                  onChange={(event) =>
                    setVideoForm((current) => ({ ...current, categoryId: event.target.value }))
                  }
                >
                  <option value="">-</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={t.description}>
              <textarea
                value={videoForm.shortDescription}
                onChange={(event) =>
                  setVideoForm((current) => ({ ...current, shortDescription: event.target.value }))
                }
              />
            </Field>
            <div className="card-actions">
              <button className="small-action" type="button" onClick={handleSaveVideo}>
                {t.save}
              </button>
              <button
                className="small-action ghost"
                type="button"
                onClick={() => {
                  setEditingVideoId(null);
                  setVideoForm(initialVideoForm);
                }}
              >
                {t.cancel}
              </button>
            </div>
            <div className="mini-list">
              {filteredVideos.length ? (
                filteredVideos.map((video) => (
                  <article
                    className={editingVideoId === video.videoId ? "selectable-row active" : "selectable-row"}
                    key={video.videoId}
                  >
                    <strong>{video.title}</strong>
                    <div className="row-meta">
                      <span>{video.trainer?.trainerName ?? "-"}</span>
                      <span>{video.category?.categoryName ?? "-"}</span>
                      <span>{video.duration ? `${video.duration} min` : "-"}</span>
                    </div>
                    <div className="row-actions">
                      <button className="tiny-button" type="button" onClick={() => fillVideoForm(video)}>
                        {t.edit}
                      </button>
                      <button className="tiny-button danger" type="button" onClick={() => handleDeleteVideo(video.videoId)}>
                        {t.delete}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card inline-empty">{t.adminNoMatches}</article>
              )}
            </div>
          </article>
        ) : null}

        {adminSection === "users" ? (
          <article className="admin-card admin-card-wide">
            <h3>{t.userManager}</h3>
            <div className="admin-form-grid">
              <Field label={t.authName}>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.authEmail}>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.authPassword}>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </Field>
              <Field label={t.role}>
                <select
                  value={userForm.roleCode}
                  onChange={(event) =>
                    setUserForm((current) => ({
                      ...current,
                      roleCode: event.target.value as UserFormState["roleCode"],
                    }))
                  }
                >
                  <option value="USER">{t.roleUser}</option>
                  <option value="ADMIN">{t.roleAdmin}</option>
                </select>
              </Field>
              <Field label={t.accountStatus}>
                <select
                  value={userForm.accountStatus}
                  onChange={(event) =>
                    setUserForm((current) => ({
                      ...current,
                      accountStatus: event.target.value as UserFormState["accountStatus"],
                    }))
                  }
                >
                  <option value="ACTIVE">{t.statusActive}</option>
                  <option value="BLOCKED">{t.statusSuspended}</option>
                </select>
              </Field>
            </div>
            <div className="admin-form-grid admin-form-grid-compact">
              <Field label={t.assignPlan}>
                <select
                  value={userForm.subscriptionPlanId}
                  onChange={(event) =>
                    setUserForm((current) => ({
                      ...current,
                      subscriptionPlanId: event.target.value,
                    }))
                  }
                >
                  <option value="">-</option>
                  {packages.map((subscriptionPlan) => (
                    <option key={subscriptionPlan.planId} value={subscriptionPlan.planId}>
                      {subscriptionPlan.planName}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="checkbox-chip admin-chip">
                <input
                  checked={userForm.autoRenew}
                  type="checkbox"
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, autoRenew: event.target.checked }))
                  }
                />
                <span>Auto renew</span>
              </label>
            </div>
            <div className="selection-box admin-selection-box">
              <span>{t.currentPlan}</span>
              <p>{editingUserActiveSubscription?.plan?.planName ?? t.noSubscriptions}</p>
            </div>
            <div className="card-actions">
              <button className="small-action" disabled={!editingUserId} type="button" onClick={handleSaveUser}>
                {t.save}
              </button>
              <button
                className="small-action ghost"
                type="button"
                onClick={() => {
                  setEditingUserId(null);
                  setUserForm(initialUserForm);
                }}
              >
                {t.cancel}
              </button>
              <button
                className="small-action"
                disabled={!editingUserId || !userForm.subscriptionPlanId}
                type="button"
                onClick={handleAssignSubscriptionToUser}
              >
                {t.assignPlan}
              </button>
            </div>
            <div className="user-table">
              {filteredUsers.length ? (
                filteredUsers.map((listedUser) => (
                  <article
                    className={editingUserId === listedUser.userId ? "user-row active" : "user-row"}
                    key={listedUser.userId}
                  >
                    <strong>{listedUser.name}</strong>
                    <span>{listedUser.email}</span>
                    <div className="row-meta row-meta-end">
                      <span>{listedUser.role}</span>
                      <span>{listedUser.accountStatus ?? t.statusActive}</span>
                      <span>
                        {subscriptions.filter((subscription) => subscription.userId === listedUser.userId).length} {t.statsSubscriptions.toLowerCase()}
                      </span>
                    </div>
                    <div className="row-actions row-actions-end">
                      <button className="tiny-button" type="button" onClick={() => fillUserForm(listedUser)}>
                        {t.edit}
                      </button>
                      <button className="tiny-button danger" type="button" onClick={() => handleDeleteUser(listedUser.userId)}>
                        {t.delete}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <article className="empty-card inline-empty">{t.adminNoMatches}</article>
              )}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
